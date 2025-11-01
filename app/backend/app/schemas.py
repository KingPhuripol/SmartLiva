from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum

# Enums
class GenderEnum(str, Enum):
    MALE = "Male"
    FEMALE = "Female"
    OTHER = "Other"

class StudyStatusEnum(str, Enum):
    SCHEDULED = "SCHEDULED"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"

class ReportStatusEnum(str, Enum):
    DRAFT = "DRAFT"
    PRELIMINARY = "PRELIMINARY"
    FINAL = "FINAL"
    AMENDED = "AMENDED"

class UrgencyLevelEnum(str, Enum):
    ROUTINE = "Routine"
    URGENT = "Urgent"
    STAT = "STAT"

class FibrosisStageEnum(str, Enum):
    F0 = "F0"
    F1 = "F1"
    F2 = "F2"
    F3 = "F3"
    F4 = "F4"

class ViewTypeEnum(str, Enum):
    INTERCOSTAL = "Intercostal"
    SUBCOSTAL = "Subcostal_hepatic_vein"
    LIVER_RK = "Liver/RK"

# Patient Schemas
class PatientBase(BaseModel):
    hospital_number: Optional[str] = None
    first_name: str
    last_name: str
    date_of_birth: date
    gender: GenderEnum
    phone: Optional[str] = None
    email: Optional[str] = None  # Changed from EmailStr to str
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    medical_history: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = None
    emergency_phone: Optional[str] = None
    blood_type: Optional[str] = None
    allergies: Optional[str] = None
    current_medications: Optional[str] = None
    medical_history: Optional[str] = None

class PatientResponse(PatientBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

# Doctor Schemas
class DoctorBase(BaseModel):
    license_number: str
    first_name: str
    last_name: str
    specialization: str
    department: Optional[str] = None
    email: str
    phone: Optional[str] = None

class DoctorCreate(DoctorBase):
    pass

class DoctorResponse(DoctorBase):
    id: str
    signature_verified: bool
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Study Schemas
class StudyBase(BaseModel):
    patient_id: str
    doctor_id: str
    study_date: datetime
    study_time: Optional[str] = None
    modality: str = "US"
    body_part: str = "LIVER"
    study_description: Optional[str] = None
    clinical_indication: Optional[str] = None
    referring_physician: Optional[str] = None
    urgency_level: UrgencyLevelEnum = UrgencyLevelEnum.ROUTINE

class StudyCreate(StudyBase):
    study_id: Optional[str] = None

class StudyResponse(StudyBase):
    id: str
    study_id: str
    status: StudyStatusEnum
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Medical Image Schemas
class MedicalImageBase(BaseModel):
    view_type: ViewTypeEnum
    image_type: str = "Original"
    acquisition_datetime: Optional[datetime] = None
    width: Optional[int] = None
    height: Optional[int] = None

class MedicalImageResponse(MedicalImageBase):
    id: str
    study_id: str
    sop_instance_uid: Optional[str] = None
    series_number: Optional[int] = None
    instance_number: Optional[int] = None
    image_format: str
    image_size_bytes: Optional[int] = None
    image_quality_score: Optional[float] = None
    artifacts_detected: Optional[str] = None
    created_at: datetime
    uploaded_by: Optional[str] = None

    class Config:
        from_attributes = True

# Analysis Result Schemas
class AnalysisResultBase(BaseModel):
    model_name: str
    model_version: str
    predicted_te_kpa: Optional[float] = None
    fibrosis_stage: Optional[FibrosisStageEnum] = None
    swe_stage_input: Optional[str] = None
    clamped_te_kpa: Optional[float] = None
    predicted_class: Optional[str] = None
    confidence_score: Optional[float] = None
    class_probabilities: Optional[str] = None  # JSON string
    epistemic_uncertainty: Optional[float] = None
    aleatoric_uncertainty: Optional[float] = None
    prediction_interval_lower: Optional[float] = None
    prediction_interval_upper: Optional[float] = None
    high_confidence: Optional[bool] = None
    requires_review: Optional[bool] = None
    anomaly_detected: Optional[bool] = None
    clinical_correlation: Optional[str] = None
    recommendations: Optional[str] = None
    processing_time_ms: Optional[int] = None

class AnalysisResultCreate(AnalysisResultBase):
    study_id: str
    image_id: str

class AnalysisResultResponse(AnalysisResultBase):
    id: str
    study_id: str
    image_id: str
    analysis_timestamp: datetime

    class Config:
        from_attributes = True

# Medical Report Schemas
class MedicalReportBase(BaseModel):
    report_type: str = "LIVER_ULTRASOUND"
    clinical_history: Optional[str] = None
    examination_technique: Optional[str] = None
    findings: str
    impression: str
    recommendations: Optional[str] = None
    ai_assisted: bool = True
    ai_confidence_summary: Optional[str] = None
    manual_overrides: Optional[str] = None  # JSON string
    template_used: Optional[str] = None

class MedicalReportCreate(MedicalReportBase):
    study_id: str
    patient_id: str
    doctor_id: str

class MedicalReportResponse(MedicalReportBase):
    id: str
    study_id: str
    patient_id: str
    doctor_id: str
    report_status: ReportStatusEnum
    report_date: datetime
    peer_reviewed: bool
    reviewed_by: Optional[str] = None
    review_date: Optional[datetime] = None
    quality_score: Optional[float] = None
    signed: bool
    signature_timestamp: Optional[datetime] = None
    signature_hash: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    finalized_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Enhanced Analysis Response with Clinical Context
class EnhancedAnalysisResponse(BaseModel):
    # Core Analysis
    fibrosis_analysis: Dict[str, Any]
    classification_analysis: Dict[str, Any]
    
    # Clinical Integration
    clinical_correlation: str
    risk_assessment: str
    follow_up_recommendations: List[str]
    
    # Quality Metrics
    confidence_metrics: Dict[str, float]
    quality_flags: List[str]
    
    # Comparative Analysis
    historical_comparison: Optional[Dict[str, Any]] = None
    reference_ranges: Dict[str, Any]
    
    # Educational Content
    condition_explanation: str
    patient_friendly_summary: str

# Batch Processing Schemas
class BatchAnalysisRequest(BaseModel):
    study_ids: List[str]
    priority: str = "normal"  # high, normal, low
    notification_email: Optional[str] = None

class BatchAnalysisResponse(BaseModel):
    batch_id: str
    total_studies: int
    estimated_completion_time: int  # minutes
    status: str

# DICOM Integration Schemas
class DICOMImportRequest(BaseModel):
    dicom_file_path: str
    patient_id: Optional[str] = None
    auto_create_patient: bool = False

class DICOMImportResponse(BaseModel):
    success: bool
    study_id: Optional[str] = None
    images_imported: int
    warnings: List[str]
    errors: List[str]

# Quality Assurance Schemas
class QualityReviewRequest(BaseModel):
    study_id: str
    reviewer_notes: str
    quality_score: float
    approved: bool

class QualityMetrics(BaseModel):
    image_quality_score: float
    analysis_confidence: float
    clinical_correlation_score: float
    overall_quality: str  # Excellent, Good, Fair, Poor

# Audit Trail Schemas
class AuditLogResponse(BaseModel):
    id: str
    timestamp: datetime
    user_name: str
    action: str
    resource_type: str
    resource_id: str
    ip_address: Optional[str] = None
    change_reason: Optional[str] = None
    risk_level: str

    class Config:
        from_attributes = True

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_patients: int
    total_studies: int
    completed_studies: int
    completion_rate: float
    analysis_distribution: List[Dict[str, Any]]
    fibrosis_distribution: List[Dict[str, Any]]
    high_risk_cases: int
    period: Dict[str, str]

class PerformanceMetrics(BaseModel):
    average_processing_time: float
    accuracy_metrics: Dict[str, float]
    throughput: Dict[str, int]
    error_rates: Dict[str, float]
    user_satisfaction_score: float

# Configuration Schemas
class SystemConfigResponse(BaseModel):
    id: str
    config_key: str
    config_value: str
    description: str
    data_type: str
    created_at: datetime
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

    class Config:
        from_attributes = True
