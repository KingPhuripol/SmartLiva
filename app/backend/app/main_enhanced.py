"""
SmartLiva Medical AI System - Enhanced Main Application

This module provides a comprehensive liver health analysis system with:
- Clinical-grade AI models with uncertainty quantification
- HIPAA-compliant security and data protection
- Professional medical reporting with digital signatures
- Integration APIs for healthcare systems
- Comprehensive audit logging and monitoring

Author: SmartLiva Development Team
Version: 2.0 Clinical Grade
"""

from fastapi import FastAPI, HTTPException, Depends, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.security import HTTPBearer
from fastapi.responses import JSONResponse
import uvicorn
import os
import logging
from datetime import datetime, timezone
from contextlib import asynccontextmanager
from typing import Dict, Any

# Import our modules
from .database import engine, create_tables, get_db
from .models import Base
from .clinical_routes import router as clinical_router
from .security import security_manager, audit_logger, AuthenticationService, get_current_user
from .enhanced_models import ClinicalGradeFibrosisModel, EnhancedClassificationModel
from .report_generator import MedicalReportGenerator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Global model instances (loaded on startup)
MODELS = {
    'fibrosis_model': None,
    'classification_model': None,
    'report_generator': None
}

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management."""
    # Startup
    logger.info("Starting SmartLiva Clinical System...")
    
    # Create database tables
    try:
        create_tables()
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise
    
    # Load AI models
    try:
        logger.info("Loading clinical-grade AI models...")
        
        # Load enhanced fibrosis model
        MODELS['fibrosis_model'] = ClinicalGradeFibrosisModel(
            pretrained="openai",
            model_name="ViT-B-32",
            num_ensemble_models=5,
            uncertainty_threshold=0.3
        )
        
        # Load enhanced classification model
        MODELS['classification_model'] = EnhancedClassificationModel(
            model_name="timm/maxvit_large_tf_224.in1k",
            num_classes=7,
            use_test_time_augmentation=True
        )
        
        # Initialize report generator
        hospital_info = {
            'name': os.getenv('HOSPITAL_NAME', 'SmartLiva Medical Center'),
            'address': os.getenv('HOSPITAL_ADDRESS', '123 Medical Plaza, Healthcare District'),
            'phone': os.getenv('HOSPITAL_PHONE', '+1-555-MEDICAL'),
            'email': os.getenv('HOSPITAL_EMAIL', 'info@smartliva.med'),
            'license': os.getenv('HOSPITAL_LICENSE', 'MED-2024-SMARTLIVA')
        }
        
        MODELS['report_generator'] = MedicalReportGenerator(hospital_info)
        
        logger.info("All models loaded successfully")
        
    except Exception as e:
        logger.error(f"Model loading failed: {e}")
        raise
    
    # Log system startup
    audit_logger.log_security_event(
        "SYSTEM_STARTUP",
        None,
        "localhost",
        "SmartLiva Clinical System started successfully",
        "INFO"
    )
    
    yield
    
    # Shutdown
    logger.info("Shutting down SmartLiva Clinical System...")
    audit_logger.log_security_event(
        "SYSTEM_SHUTDOWN",
        None,
        "localhost",
        "SmartLiva Clinical System shutdown",
        "INFO"
    )

# Create FastAPI application
app = FastAPI(
    title="SmartLiva Clinical AI System",
    description="""
    ## SmartLiva - Clinical-Grade Liver Health Analysis Platform
    
    A comprehensive AI-powered liver health analysis system designed for healthcare professionals.
    
    ### Key Features:
    - **Clinical-Grade AI**: Enhanced models with uncertainty quantification
    - **HIPAA Compliance**: Full data protection and security measures  
    - **Digital Reports**: Professional medical reports with digital signatures
    - **Integration Ready**: APIs for HIS/PACS integration
    - **Audit Logging**: Comprehensive tracking for compliance
    
    ### Security:
    - Multi-factor authentication
    - Role-based access control (RBAC)
    - End-to-end encryption
    - Session management
    - Comprehensive audit trails
    
    ### AI Models:
    - **FibroGauge™**: Liver stiffness assessment with elastography equivalence
    - **PathoScope™**: Liver lesion classification with malignancy detection
    - **QualityAssure™**: Image quality assessment and artifact detection
    
    ---
    *This system is intended for use by qualified medical professionals only.*
    """,
    version="2.0.0",
    contact={
        "name": "SmartLiva Support",
        "email": "support@smartliva.med",
        "url": "https://smartliva.med/support"
    },
    license_info={
        "name": "SmartLiva Medical License",
        "url": "https://smartliva.med/license"
    },
    lifespan=lifespan
)

# Security middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Trusted host middleware for production
if os.getenv("ENVIRONMENT") == "production":
    allowed_hosts = os.getenv("ALLOWED_HOSTS", "smartliva.med").split(",")
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=allowed_hosts)

# Security headers middleware
@app.middleware("http")
async def security_headers(request: Request, call_next):
    """Add security headers to all responses."""
    response = await call_next(request)
    
    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "script-src 'self' 'unsafe-inline'; "
        "style-src 'self' 'unsafe-inline'; "
        "img-src 'self' data: blob:; "
        "connect-src 'self'; "
        "font-src 'self'; "
        "object-src 'none'; "
        "base-uri 'self'; "
        "form-action 'self'"
    )
    
    return response

# Request logging middleware
@app.middleware("http")
async def request_logging(request: Request, call_next):
    """Log all requests for audit purposes."""
    start_time = datetime.now(timezone.utc)
    
    # Log request
    logger.info(
        f"Request: {request.method} {request.url.path} "
        f"from {request.client.host} "
        f"User-Agent: {request.headers.get('user-agent', 'Unknown')}"
    )
    
    response = await call_next(request)
    
    # Calculate processing time
    process_time = (datetime.now(timezone.utc) - start_time).total_seconds()
    
    # Log response
    logger.info(
        f"Response: {response.status_code} "
        f"Time: {process_time:.3f}s"
    )
    
    # Add processing time header
    response.headers["X-Process-Time"] = str(process_time)
    
    return response

# Include routers
app.include_router(clinical_router, prefix="/api/v1", tags=["clinical"])

# Root endpoint
@app.get("/", tags=["system"])
async def root():
    """System information and health check."""
    return {
        "system": "SmartLiva Clinical AI System",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "Clinical-Grade AI Models",
            "HIPAA Compliance",
            "Digital Medical Reports", 
            "Security & Audit Logging",
            "Healthcare Integration APIs"
        ],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "models_loaded": all(model is not None for model in MODELS.values())
    }

@app.get("/health", tags=["system"])
async def health_check():
    """Detailed health check for monitoring systems."""
    
    # Check database connectivity
    try:
        from .database import SessionLocal
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "healthy"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "unhealthy"
    
    # Check model availability
    models_status = {
        name: "loaded" if model is not None else "not_loaded"
        for name, model in MODELS.items()
    }
    
    # Overall system health
    overall_status = "healthy" if (
        db_status == "healthy" and 
        all(status == "loaded" for status in models_status.values())
    ) else "degraded"
    
    health_data = {
        "status": overall_status,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            "database": db_status,
            "models": models_status,
            "security": "enabled",
            "audit_logging": "active"
        },
        "uptime_seconds": (datetime.now(timezone.utc) - start_time).total_seconds() if 'start_time' in globals() else 0
    }
    
    status_code = 200 if overall_status == "healthy" else 503
    return JSONResponse(content=health_data, status_code=status_code)

# Authentication endpoints
auth_service = AuthenticationService()

@app.post("/auth/login", tags=["authentication"])
async def login(
    request: Request,
    credentials: Dict[str, str],
    db = Depends(get_db)
):
    """Authenticate user and create session."""
    
    username = credentials.get("username")
    password = credentials.get("password")
    
    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password required"
        )
    
    try:
        return await auth_service.authenticate_user(
            username=username,
            password=password,
            ip_address=request.client.host,
            user_agent=request.headers.get("user-agent", ""),
            db=db
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication service error"
        )

@app.post("/auth/logout", tags=["authentication"])
async def logout(
    request: Request,
    current_user = Depends(get_current_user)
):
    """Logout user and invalidate session."""
    
    try:
        # Extract session ID from token (you'll need to implement this)
        # session_id = extract_session_id_from_token(request)
        
        # For now, invalidate all user sessions
        security_manager.invalidate_all_user_sessions(current_user.id)
        
        # Log logout
        audit_logger.log_access(
            current_user.id,
            "LOGOUT",
            "SYSTEM",
            "AUTH",
            request.client.host,
            request.headers.get("user-agent", ""),
            success=True
        )
        
        return {"message": "Logged out successfully"}
        
    except Exception as e:
        logger.error(f"Logout error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Logout failed"
        )

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Handle HTTP exceptions with proper logging."""
    
    # Log security-relevant errors
    if exc.status_code in [401, 403, 429]:
        audit_logger.log_security_event(
            f"HTTP_{exc.status_code}",
            None,
            request.client.host,
            f"Path: {request.url.path}, Detail: {exc.detail}",
            "WARNING"
        )
    
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail,
            "status_code": exc.status_code,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions."""
    
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    audit_logger.log_security_event(
        "SYSTEM_ERROR",
        None,
        request.client.host,
        f"Unhandled exception: {str(exc)}",
        "ERROR"
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "status_code": 500,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    )

# Global startup time tracking
start_time = datetime.now(timezone.utc)

if __name__ == "__main__":
    # Production deployment configuration
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    uvicorn.run(
        "app.main:app",
        host=host,
        port=port,
        reload=os.getenv("ENVIRONMENT") == "development",
        access_log=True,
        log_level="info",
        ssl_keyfile=os.getenv("SSL_KEYFILE"),
        ssl_certfile=os.getenv("SSL_CERTFILE"),
    )
