from sqlalchemy import Column, Integer, String, DateTime, Text, Float, Boolean, ForeignKey, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import uuid

Base = declarative_base()

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    hospital_number = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    date_of_birth = Column(DateTime, nullable=False)
    gender = Column(String, nullable=False)  # Male, Female, Other
    phone = Column(String)
    email = Column(String)
    address = Column(Text)
    emergency_contact = Column(String)
    emergency_phone = Column(String)
    
    # Medical Information
    blood_type = Column(String)
    allergies = Column(Text)
    current_medications = Column(Text)
    medical_history = Column(Text)
    
    # System fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    studies = relationship("Study", back_populates="patient")
    reports = relationship("MedicalReport", back_populates="patient")

class Doctor(Base):
    __tablename__ = "doctors"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    license_number = Column(String, unique=True, nullable=False)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    specialization = Column(String, nullable=False)
    department = Column(String)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String)
    
    # Digital Signature
    digital_signature = Column(LargeBinary)
    signature_verified = Column(Boolean, default=False)
    
    # System fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    is_active = Column(Boolean, default=True)
    
    # Relationships
    studies = relationship("Study", back_populates="doctor")
    reports = relationship("MedicalReport", back_populates="doctor")

class Study(Base):
    __tablename__ = "studies"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String, unique=True, nullable=False)  # DICOM Study Instance UID
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False)
    
    # Study Information
    study_date = Column(DateTime, nullable=False)
    study_time = Column(String)
    modality = Column(String, default="US")  # Ultrasound
    body_part = Column(String, default="LIVER")
    study_description = Column(String)
    
    # Clinical Information
    clinical_indication = Column(Text)
    referring_physician = Column(String)
    urgency_level = Column(String, default="Routine")  # Routine, Urgent, STAT
    
    # System fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    status = Column(String, default="SCHEDULED")  # SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
    
    # Relationships
    patient = relationship("Patient", back_populates="studies")
    doctor = relationship("Doctor", back_populates="studies")
    images = relationship("MedicalImage", back_populates="study")
    analysis_results = relationship("AnalysisResult", back_populates="study")
    reports = relationship("MedicalReport", back_populates="study")

class MedicalImage(Base):
    __tablename__ = "medical_images"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String, ForeignKey("studies.id"), nullable=False)
    
    # DICOM Information
    sop_instance_uid = Column(String, unique=True)  # DICOM SOP Instance UID
    series_number = Column(Integer)
    instance_number = Column(Integer)
    
    # Image Information
    image_type = Column(String)  # Original, Processed
    view_type = Column(String)  # Intercostal, Subcostal_hepatic_vein, Liver/RK
    acquisition_datetime = Column(DateTime)
    
    # Image Data
    image_data = Column(LargeBinary)  # Compressed image data
    image_format = Column(String, default="JPEG")  # JPEG, PNG, DICOM
    image_size_bytes = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    
    # Quality Metrics
    image_quality_score = Column(Float)  # AI-assessed quality (0-1)
    artifacts_detected = Column(Text)  # JSON of detected artifacts
    
    # System fields
    created_at = Column(DateTime, server_default=func.now())
    uploaded_by = Column(String)  # User ID who uploaded
    
    # Relationships
    study = relationship("Study", back_populates="images")
    analysis_results = relationship("AnalysisResult", back_populates="image")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String, ForeignKey("studies.id"), nullable=False)
    image_id = Column(String, ForeignKey("medical_images.id"), nullable=False)
    
    # AI Model Information
    model_name = Column(String, nullable=False)  # fibrosis_clip, classification_maxvit
    model_version = Column(String, nullable=False)
    analysis_timestamp = Column(DateTime, server_default=func.now())
    
    # Fibrosis Analysis Results
    predicted_te_kpa = Column(Float)  # Predicted TE value in kPa
    fibrosis_stage = Column(String)  # F0, F1, F2, F3, F4
    swe_stage_input = Column(String)  # Input SWE stage for clamping
    clamped_te_kpa = Column(Float)  # TE after SWE clamping
    
    # Classification Results
    predicted_class = Column(String)  # FFC, FFS, HCC, etc.
    confidence_score = Column(Float)  # Model confidence (0-1)
    class_probabilities = Column(Text)  # JSON of all class probabilities
    
    # Uncertainty Quantification
    epistemic_uncertainty = Column(Float)  # Model uncertainty
    aleatoric_uncertainty = Column(Float)  # Data uncertainty
    prediction_interval_lower = Column(Float)
    prediction_interval_upper = Column(Float)
    
    # Quality Flags
    high_confidence = Column(Boolean)  # confidence > threshold
    requires_review = Column(Boolean)  # flags for manual review
    anomaly_detected = Column(Boolean)  # out-of-distribution detection
    
    # Clinical Context
    clinical_correlation = Column(Text)  # How results correlate with clinical data
    recommendations = Column(Text)  # AI-generated recommendations
    
    # System fields
    processing_time_ms = Column(Integer)  # Time taken for analysis
    
    # Relationships
    study = relationship("Study", back_populates="analysis_results")
    image = relationship("MedicalImage", back_populates="analysis_results")

class MedicalReport(Base):
    __tablename__ = "medical_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    study_id = Column(String, ForeignKey("studies.id"), nullable=False)
    patient_id = Column(String, ForeignKey("patients.id"), nullable=False)
    doctor_id = Column(String, ForeignKey("doctors.id"), nullable=False)
    
    # Report Information
    report_type = Column(String, default="LIVER_ULTRASOUND")
    report_status = Column(String, default="DRAFT")  # DRAFT, PRELIMINARY, FINAL, AMENDED
    report_date = Column(DateTime, server_default=func.now())
    
    # Clinical Content
    clinical_history = Column(Text)
    examination_technique = Column(Text)
    findings = Column(Text, nullable=False)
    impression = Column(Text, nullable=False)
    recommendations = Column(Text)
    
    # AI Integration
    ai_assisted = Column(Boolean, default=True)
    ai_confidence_summary = Column(Text)  # Summary of AI confidence levels
    manual_overrides = Column(Text)  # JSON of any manual corrections
    
    # Quality Assurance
    peer_reviewed = Column(Boolean, default=False)
    reviewed_by = Column(String)  # Doctor ID who reviewed
    review_date = Column(DateTime)
    quality_score = Column(Float)  # Internal quality metric
    
    # Digital Signature
    signed = Column(Boolean, default=False)
    signature_timestamp = Column(DateTime)
    signature_hash = Column(String)  # Hash of report content when signed
    
    # System fields
    template_used = Column(String)  # Report template identifier
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    finalized_at = Column(DateTime)
    
    # Relationships
    study = relationship("Study", back_populates="reports")
    patient = relationship("Patient", back_populates="reports")
    doctor = relationship("Doctor", back_populates="reports")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, server_default=func.now())
    
    # Actor Information
    user_id = Column(String, nullable=False)
    user_type = Column(String, nullable=False)  # DOCTOR, TECHNICIAN, ADMIN
    user_name = Column(String)
    
    # Action Information
    action = Column(String, nullable=False)  # CREATE, READ, UPDATE, DELETE, SIGN
    resource_type = Column(String, nullable=False)  # PATIENT, STUDY, REPORT, etc.
    resource_id = Column(String, nullable=False)
    
    # Context
    ip_address = Column(String)
    user_agent = Column(String)
    session_id = Column(String)
    
    # Changes
    old_values = Column(Text)  # JSON of old values
    new_values = Column(Text)  # JSON of new values
    change_reason = Column(Text)
    
    # Security
    risk_level = Column(String, default="LOW")  # LOW, MEDIUM, HIGH
    flagged_for_review = Column(Boolean, default=False)

class SystemConfiguration(Base):
    __tablename__ = "system_config"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    config_key = Column(String, unique=True, nullable=False)
    config_value = Column(Text)
    description = Column(Text)
    data_type = Column(String, default="STRING")  # STRING, INTEGER, FLOAT, BOOLEAN, JSON
    
    # Validation
    min_value = Column(Float)
    max_value = Column(Float)
    allowed_values = Column(Text)  # JSON array of allowed values
    
    # System fields
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, onupdate=func.now())
    updated_by = Column(String)
    
    # Security
    sensitive = Column(Boolean, default=False)  # Mask value in logs
    requires_restart = Column(Boolean, default=False)
