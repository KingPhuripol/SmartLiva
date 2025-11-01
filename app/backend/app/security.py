from fastapi import HTTPException, status, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict, Any
import secrets
import hashlib
import bcrypt
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
import base64
import os
import redis
import json
import logging
from pydantic import BaseModel
from sqlalchemy.orm import Session
import re

# Security configuration
SECRET_KEY = os.getenv("SECRET_KEY", secrets.token_urlsafe(32))
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
REFRESH_TOKEN_EXPIRE_DAYS = 7
PASSWORD_RESET_EXPIRE_MINUTES = 15

# HIPAA-compliant logging
logging.basicConfig(level=logging.INFO)
security_logger = logging.getLogger("security")

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme
security = HTTPBearer()

# Redis for session management (in production, use Redis cluster)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
except:
    redis_client = None

class SecurityConfig:
    """HIPAA-compliant security configuration."""
    
    # Password policy
    MIN_PASSWORD_LENGTH = 12
    REQUIRE_UPPERCASE = True
    REQUIRE_LOWERCASE = True
    REQUIRE_DIGITS = True
    REQUIRE_SPECIAL_CHARS = True
    PASSWORD_HISTORY_COUNT = 12  # Remember last 12 passwords
    
    # Session management
    MAX_SESSIONS_PER_USER = 3
    SESSION_TIMEOUT_MINUTES = 30
    IDLE_TIMEOUT_MINUTES = 15
    
    # Account lockout
    MAX_LOGIN_ATTEMPTS = 5
    LOCKOUT_DURATION_MINUTES = 30
    
    # Audit requirements
    LOG_ALL_ACCESS = True
    LOG_FAILED_ATTEMPTS = True
    LOG_PRIVILEGE_ESCALATION = True
    
    # Data encryption
    ENCRYPT_PHI = True  # Protected Health Information
    ENCRYPT_BACKUPS = True
    USE_TLS_ONLY = True

class UserRole(BaseModel):
    """User role definitions with RBAC permissions."""
    name: str
    permissions: List[str]
    description: str

class SystemRoles:
    """Predefined system roles with healthcare-specific permissions."""
    
    SUPER_ADMIN = UserRole(
        name="SUPER_ADMIN",
        permissions=[
            "system:manage", "user:manage", "audit:view", "config:manage",
            "patient:read", "patient:write", "patient:delete",
            "study:read", "study:write", "study:delete",
            "report:read", "report:write", "report:sign", "report:export",
            "ai:configure", "ai:monitor"
        ],
        description="Full system administrator"
    )
    
    ADMIN = UserRole(
        name="ADMIN",
        permissions=[
            "user:manage", "audit:view",
            "patient:read", "patient:write",
            "study:read", "study:write",
            "report:read", "report:write", "report:export",
            "ai:monitor"
        ],
        description="Hospital administrator"
    )
    
    DOCTOR = UserRole(
        name="DOCTOR",
        permissions=[
            "patient:read", "patient:write",
            "study:read", "study:write",
            "report:read", "report:write", "report:sign", "report:export",
            "ai:use"
        ],
        description="Licensed physician"
    )
    
    RADIOLOGIST = UserRole(
        name="RADIOLOGIST",
        permissions=[
            "patient:read",
            "study:read", "study:write",
            "report:read", "report:write", "report:sign", "report:export",
            "ai:use", "ai:review"
        ],
        description="Radiology specialist"
    )
    
    TECHNICIAN = UserRole(
        name="TECHNICIAN",
        permissions=[
            "patient:read",
            "study:read", "study:write",
            "report:read",
            "ai:use"
        ],
        description="Medical technician"
    )
    
    NURSE = UserRole(
        name="NURSE",
        permissions=[
            "patient:read", "patient:write",
            "study:read",
            "report:read"
        ],
        description="Registered nurse"
    )
    
    RESEARCHER = UserRole(
        name="RESEARCHER",
        permissions=[
            "patient:read_anonymized",
            "study:read_anonymized",
            "report:read_anonymized",
            "ai:analyze", "ai:export_data"
        ],
        description="Research personnel - anonymized data only"
    )

class SecurityManager:
    """Comprehensive security manager for HIPAA compliance."""
    
    def __init__(self):
        self.config = SecurityConfig()
        self.encryption_key = self._get_or_create_encryption_key()
        self.cipher_suite = Fernet(self.encryption_key)
        
    def _get_or_create_encryption_key(self) -> bytes:
        """Get or create encryption key for PHI data."""
        key_file = os.getenv("ENCRYPTION_KEY_FILE", ".encryption_key")
        
        if os.path.exists(key_file):
            with open(key_file, 'rb') as f:
                return f.read()
        else:
            key = Fernet.generate_key()
            with open(key_file, 'wb') as f:
                f.write(key)
            os.chmod(key_file, 0o600)  # Read-only for owner
            return key
    
    def hash_password(self, password: str) -> str:
        """Hash password using bcrypt with salt."""
        return pwd_context.hash(password)
    
    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify password against hash."""
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception as e:
            security_logger.warning(f"Password verification error: {e}")
            return False
    
    def validate_password_policy(self, password: str) -> Dict[str, Any]:
        """Validate password against HIPAA-compliant policy."""
        errors = []
        
        if len(password) < self.config.MIN_PASSWORD_LENGTH:
            errors.append(f"Password must be at least {self.config.MIN_PASSWORD_LENGTH} characters")
        
        if self.config.REQUIRE_UPPERCASE and not re.search(r'[A-Z]', password):
            errors.append("Password must contain at least one uppercase letter")
            
        if self.config.REQUIRE_LOWERCASE and not re.search(r'[a-z]', password):
            errors.append("Password must contain at least one lowercase letter")
            
        if self.config.REQUIRE_DIGITS and not re.search(r'\d', password):
            errors.append("Password must contain at least one digit")
            
        if self.config.REQUIRE_SPECIAL_CHARS and not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            errors.append("Password must contain at least one special character")
        
        # Check for common patterns
        if re.search(r'(.)\1{2,}', password):
            errors.append("Password cannot contain repeated characters")
            
        if re.search(r'(012|123|234|345|456|567|678|789|890)', password):
            errors.append("Password cannot contain sequential digits")
        
        return {
            'valid': len(errors) == 0,
            'errors': errors,
            'strength_score': self._calculate_password_strength(password)
        }
    
    def _calculate_password_strength(self, password: str) -> float:
        """Calculate password strength score (0-1)."""
        score = 0.0
        
        # Length bonus
        score += min(len(password) / 20, 0.3)
        
        # Character diversity
        if re.search(r'[a-z]', password):
            score += 0.1
        if re.search(r'[A-Z]', password):
            score += 0.1
        if re.search(r'\d', password):
            score += 0.1
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            score += 0.15
        
        # Uniqueness (simplified entropy calculation)
        unique_chars = len(set(password))
        score += min(unique_chars / len(password), 0.25)
        
        return min(score, 1.0)
    
    def encrypt_phi_data(self, data: str) -> str:
        """Encrypt Protected Health Information."""
        if not self.config.ENCRYPT_PHI:
            return data
        
        try:
            encrypted_data = self.cipher_suite.encrypt(data.encode())
            return base64.b64encode(encrypted_data).decode()
        except Exception as e:
            security_logger.error(f"PHI encryption error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Data encryption failed"
            )
    
    def decrypt_phi_data(self, encrypted_data: str) -> str:
        """Decrypt Protected Health Information."""
        if not self.config.ENCRYPT_PHI:
            return encrypted_data
        
        try:
            decoded_data = base64.b64decode(encrypted_data.encode())
            decrypted_data = self.cipher_suite.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            security_logger.error(f"PHI decryption error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Data decryption failed"
            )
    
    def create_access_token(self, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        
        try:
            encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
            return encoded_jwt
        except Exception as e:
            security_logger.error(f"Token creation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Token creation failed"
            )
    
    def create_refresh_token(self, user_id: str) -> str:
        """Create JWT refresh token."""
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode = {
            "user_id": user_id,
            "exp": expire,
            "type": "refresh"
        }
        
        try:
            encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
            return encoded_jwt
        except Exception as e:
            security_logger.error(f"Refresh token creation error: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Refresh token creation failed"
            )
    
    def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify and decode JWT token."""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            return payload
        except JWTError as e:
            security_logger.warning(f"Token verification failed: {e}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
    
    def check_session_validity(self, user_id: str, session_id: str) -> bool:
        """Check if user session is valid."""
        if not redis_client:
            return True  # Fallback if Redis unavailable
        
        try:
            session_key = f"session:{user_id}:{session_id}"
            session_data = redis_client.get(session_key)
            
            if not session_data:
                return False
            
            session_info = json.loads(session_data)
            
            # Check if session expired
            if datetime.fromisoformat(session_info['expires']) < datetime.now(timezone.utc):
                redis_client.delete(session_key)
                return False
            
            # Update last activity
            session_info['last_activity'] = datetime.now(timezone.utc).isoformat()
            redis_client.setex(session_key, 3600, json.dumps(session_info))
            
            return True
            
        except Exception as e:
            security_logger.error(f"Session validation error: {e}")
            return False
    
    def create_user_session(self, user_id: str, ip_address: str, user_agent: str) -> str:
        """Create new user session with tracking."""
        session_id = secrets.token_urlsafe(32)
        
        if redis_client:
            try:
                session_data = {
                    'user_id': user_id,
                    'session_id': session_id,
                    'ip_address': ip_address,
                    'user_agent': user_agent,
                    'created': datetime.now(timezone.utc).isoformat(),
                    'last_activity': datetime.now(timezone.utc).isoformat(),
                    'expires': (datetime.now(timezone.utc) + timedelta(minutes=self.config.SESSION_TIMEOUT_MINUTES)).isoformat()
                }
                
                session_key = f"session:{user_id}:{session_id}"
                redis_client.setex(session_key, self.config.SESSION_TIMEOUT_MINUTES * 60, json.dumps(session_data))
                
                # Track active sessions for user
                user_sessions_key = f"user_sessions:{user_id}"
                redis_client.sadd(user_sessions_key, session_id)
                redis_client.expire(user_sessions_key, self.config.SESSION_TIMEOUT_MINUTES * 60)
                
                # Enforce session limit
                session_count = redis_client.scard(user_sessions_key)
                if session_count > self.config.MAX_SESSIONS_PER_USER:
                    # Remove oldest session
                    oldest_session = redis_client.spop(user_sessions_key)
                    if oldest_session:
                        redis_client.delete(f"session:{user_id}:{oldest_session}")
                
            except Exception as e:
                security_logger.error(f"Session creation error: {e}")
        
        return session_id
    
    def invalidate_user_session(self, user_id: str, session_id: str):
        """Invalidate specific user session."""
        if redis_client:
            try:
                session_key = f"session:{user_id}:{session_id}"
                redis_client.delete(session_key)
                
                user_sessions_key = f"user_sessions:{user_id}"
                redis_client.srem(user_sessions_key, session_id)
                
            except Exception as e:
                security_logger.error(f"Session invalidation error: {e}")
    
    def invalidate_all_user_sessions(self, user_id: str):
        """Invalidate all sessions for a user."""
        if redis_client:
            try:
                user_sessions_key = f"user_sessions:{user_id}"
                session_ids = redis_client.smembers(user_sessions_key)
                
                for session_id in session_ids:
                    session_key = f"session:{user_id}:{session_id}"
                    redis_client.delete(session_key)
                
                redis_client.delete(user_sessions_key)
                
            except Exception as e:
                security_logger.error(f"All sessions invalidation error: {e}")

class AuditLogger:
    """HIPAA-compliant audit logging system."""
    
    def __init__(self):
        self.logger = logging.getLogger("audit")
        self.logger.setLevel(logging.INFO)
        
        # Create file handler for audit logs
        audit_handler = logging.FileHandler("audit.log")
        audit_formatter = logging.Formatter(
            '%(asctime)s|%(levelname)s|%(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        )
        audit_handler.setFormatter(audit_formatter)
        self.logger.addHandler(audit_handler)
    
    def log_access(self, 
                   user_id: str,
                   action: str,
                   resource_type: str,
                   resource_id: str,
                   ip_address: str,
                   user_agent: str,
                   success: bool = True,
                   details: Optional[str] = None):
        """Log access to protected resources."""
        
        audit_entry = {
            'timestamp': datetime.now(timezone.utc).isoformat(),
            'user_id': user_id,
            'action': action,
            'resource_type': resource_type,
            'resource_id': resource_id,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'success': success,
            'details': details or ''
        }
        
        log_message = (
            f"USER:{user_id}|ACTION:{action}|RESOURCE:{resource_type}:{resource_id}|"
            f"IP:{ip_address}|SUCCESS:{success}|DETAILS:{details or 'N/A'}"
        )
        
        if success:
            self.logger.info(log_message)
        else:
            self.logger.warning(log_message)
    
    def log_security_event(self, 
                          event_type: str,
                          user_id: Optional[str],
                          ip_address: str,
                          details: str,
                          severity: str = "INFO"):
        """Log security-related events."""
        
        log_message = (
            f"SECURITY_EVENT:{event_type}|USER:{user_id or 'UNKNOWN'}|"
            f"IP:{ip_address}|SEVERITY:{severity}|DETAILS:{details}"
        )
        
        if severity == "CRITICAL":
            self.logger.critical(log_message)
        elif severity == "ERROR":
            self.logger.error(log_message)
        elif severity == "WARNING":
            self.logger.warning(log_message)
        else:
            self.logger.info(log_message)

# Global instances
security_manager = SecurityManager()
audit_logger = AuditLogger()

class AuthenticationService:
    """Authentication service with security features."""
    
    def __init__(self):
        self.security_manager = security_manager
        self.audit_logger = audit_logger
        self.failed_attempts = {}  # In production, use Redis
    
    async def authenticate_user(self, 
                               username: str, 
                               password: str, 
                               ip_address: str,
                               user_agent: str,
                               db: Session) -> Dict[str, Any]:
        """Authenticate user with security checks."""
        
        # Check for account lockout
        attempt_key = f"{username}:{ip_address}"
        failed_count = self.failed_attempts.get(attempt_key, 0)
        
        if failed_count >= SecurityConfig.MAX_LOGIN_ATTEMPTS:
            self.audit_logger.log_security_event(
                "ACCOUNT_LOCKED",
                username,
                ip_address,
                f"Account locked due to {failed_count} failed attempts",
                "WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_423_LOCKED,
                detail=f"Account locked for {SecurityConfig.LOCKOUT_DURATION_MINUTES} minutes"
            )
        
        # Get user from database (implement based on your user model)
        from .models import Doctor  # Assuming doctors are users
        user = db.query(Doctor).filter(Doctor.email == username).first()
        
        if not user or not self.security_manager.verify_password(password, user.password_hash):
            # Increment failed attempts
            self.failed_attempts[attempt_key] = failed_count + 1
            
            self.audit_logger.log_security_event(
                "LOGIN_FAILED",
                username,
                ip_address,
                f"Invalid credentials (attempt {failed_count + 1})",
                "WARNING"
            )
            
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Reset failed attempts on successful login
        if attempt_key in self.failed_attempts:
            del self.failed_attempts[attempt_key]
        
        # Create session
        session_id = self.security_manager.create_user_session(
            user.id, ip_address, user_agent
        )
        
        # Create tokens
        access_token = self.security_manager.create_access_token(
            data={
                "user_id": user.id,
                "username": username,
                "role": "DOCTOR",  # Get from user.role
                "session_id": session_id
            }
        )
        
        refresh_token = self.security_manager.create_refresh_token(user.id)
        
        # Log successful login
        self.audit_logger.log_access(
            user.id,
            "LOGIN",
            "SYSTEM",
            "AUTH",
            ip_address,
            user_agent,
            success=True
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "name": f"{user.first_name} {user.last_name}",
                "email": user.email,
                "role": "DOCTOR",
                "session_id": session_id
            }
        }

# Authentication dependencies
auth_service = AuthenticationService()

async def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user."""
    
    try:
        # Verify token
        payload = security_manager.verify_token(credentials.credentials)
        user_id = payload.get("user_id")
        session_id = payload.get("session_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
        
        # Check session validity
        if not security_manager.check_session_validity(user_id, session_id):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session expired"
            )
        
        # Get user from database
        from .models import Doctor
        user = db.query(Doctor).filter(Doctor.id == user_id).first()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        # Log access
        audit_logger.log_access(
            user_id,
            "ACCESS",
            "SYSTEM",
            "API",
            request.client.host,
            request.headers.get("user-agent", ""),
            success=True
        )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        security_logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

def require_roles(allowed_roles: List[str]):
    """Dependency to require specific roles."""
    
    def role_checker(current_user = Depends(get_current_user)):
        user_role = getattr(current_user, 'role', 'USER')
        
        if user_role not in allowed_roles:
            audit_logger.log_security_event(
                "UNAUTHORIZED_ACCESS",
                current_user.id,
                "UNKNOWN",
                f"User with role {user_role} attempted to access resource requiring {allowed_roles}",
                "WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        return current_user
    
    return role_checker

def require_permissions(required_permissions: List[str]):
    """Dependency to require specific permissions."""
    
    def permission_checker(current_user = Depends(get_current_user)):
        user_role = getattr(current_user, 'role', 'USER')
        
        # Get role permissions (implement based on your role system)
        role_permissions = SystemRoles.DOCTOR.permissions  # Default to doctor permissions
        
        if user_role == "SUPER_ADMIN":
            role_permissions = SystemRoles.SUPER_ADMIN.permissions
        elif user_role == "ADMIN":
            role_permissions = SystemRoles.ADMIN.permissions
        elif user_role == "RADIOLOGIST":
            role_permissions = SystemRoles.RADIOLOGIST.permissions
        # Add other roles as needed
        
        missing_permissions = set(required_permissions) - set(role_permissions)
        
        if missing_permissions:
            audit_logger.log_security_event(
                "PERMISSION_DENIED",
                current_user.id,
                "UNKNOWN",
                f"User missing permissions: {list(missing_permissions)}",
                "WARNING"
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permissions: {list(missing_permissions)}"
            )
        
        return current_user
    
    return permission_checker
