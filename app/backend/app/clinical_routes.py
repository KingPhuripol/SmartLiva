from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date
import uuid

from .database import get_db
from .models import Patient, Doctor, Study, MedicalImage, AnalysisResult, MedicalReport
from .schemas import (
    PatientCreate, PatientResponse, PatientUpdate,
    DoctorCreate, DoctorResponse,
    StudyCreate, StudyResponse,
    AnalysisResultResponse, MedicalReportResponse
)
from .auth import get_current_user, require_roles

router = APIRouter(prefix="/api/v1", tags=["clinical"])

# Patient Management
@router.post("/patients", response_model=PatientResponse)
async def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "NURSE", "ADMIN"]))
):
    """Create a new patient record with full medical history."""
    
    # Generate hospital number if not provided
    if not patient_data.hospital_number:
        patient_data.hospital_number = f"P{datetime.now().strftime('%Y%m%d')}{uuid.uuid4().hex[:6].upper()}"
    
    db_patient = Patient(**patient_data.dict())
    db.add(db_patient)
    
    try:
        db.commit()
        db.refresh(db_patient)
        return db_patient
    except Exception as e:
        db.rollback()
        if "unique constraint" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Patient with this hospital number already exists"
            )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating patient record"
        )

@router.get("/patients", response_model=List[PatientResponse])
async def list_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "NURSE", "ADMIN"]))
):
    """List patients with optional search by name or hospital number."""
    
    query = db.query(Patient).filter(Patient.is_active == True)
    
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search_term)) |
            (Patient.last_name.ilike(search_term)) |
            (Patient.hospital_number.ilike(search_term))
        )
    
    patients = query.offset(skip).limit(limit).all()
    return patients

@router.get("/patients/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "NURSE", "ADMIN"]))
):
    """Get detailed patient information including medical history."""
    
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_active == True
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient

@router.put("/patients/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: str,
    patient_update: PatientUpdate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "NURSE", "ADMIN"]))
):
    """Update patient information with audit trail."""
    
    patient = db.query(Patient).filter(
        Patient.id == patient_id,
        Patient.is_active == True
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Update only provided fields
    update_data = patient_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)
    
    patient.updated_at = datetime.utcnow()
    
    try:
        db.commit()
        db.refresh(patient)
        return patient
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error updating patient record"
        )

# Study Management
@router.post("/studies", response_model=StudyResponse)
async def create_study(
    study_data: StudyCreate,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "TECHNICIAN", "ADMIN"]))
):
    """Create a new medical study/examination."""
    
    # Verify patient exists
    patient = db.query(Patient).filter(
        Patient.id == study_data.patient_id,
        Patient.is_active == True
    ).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Generate study ID if not provided
    if not study_data.study_id:
        study_data.study_id = f"ST{datetime.now().strftime('%Y%m%d%H%M%S')}{uuid.uuid4().hex[:8].upper()}"
    
    db_study = Study(**study_data.dict())
    db.add(db_study)
    
    try:
        db.commit()
        db.refresh(db_study)
        return db_study
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error creating study record"
        )

@router.get("/patients/{patient_id}/studies", response_model=List[StudyResponse])
async def get_patient_studies(
    patient_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "NURSE", "ADMIN"]))
):
    """Get all studies for a specific patient."""
    
    studies = db.query(Study).filter(
        Study.patient_id == patient_id
    ).order_by(Study.study_date.desc()).all()
    
    return studies

@router.get("/studies/{study_id}/analysis", response_model=List[AnalysisResultResponse])
async def get_study_analysis(
    study_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "NURSE", "ADMIN"]))
):
    """Get AI analysis results for a study."""
    
    results = db.query(AnalysisResult).filter(
        AnalysisResult.study_id == study_id
    ).order_by(AnalysisResult.analysis_timestamp.desc()).all()
    
    return results

# Medical Reporting
@router.get("/studies/{study_id}/report", response_model=MedicalReportResponse)
async def get_study_report(
    study_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "ADMIN"]))
):
    """Get the medical report for a study."""
    
    report = db.query(MedicalReport).filter(
        MedicalReport.study_id == study_id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return report

@router.post("/studies/{study_id}/report/sign")
async def sign_report(
    study_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR"]))
):
    """Digitally sign a medical report."""
    
    report = db.query(MedicalReport).filter(
        MedicalReport.study_id == study_id,
        MedicalReport.doctor_id == current_user.id
    ).first()
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or not authorized to sign"
        )
    
    if report.signed:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Report already signed"
        )
    
    # Generate signature hash
    import hashlib
    content_hash = hashlib.sha256(
        f"{report.findings}{report.impression}{report.recommendations}".encode()
    ).hexdigest()
    
    report.signed = True
    report.signature_timestamp = datetime.utcnow()
    report.signature_hash = content_hash
    report.report_status = "FINAL"
    
    try:
        db.commit()
        return {"message": "Report signed successfully", "signature_hash": content_hash}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error signing report"
        )

# Dashboard and Analytics
@router.get("/dashboard/stats")
async def get_dashboard_stats(
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    db: Session = Depends(get_db),
    current_user = Depends(require_roles(["DOCTOR", "ADMIN"]))
):
    """Get dashboard statistics for clinical overview."""
    
    from sqlalchemy import func, and_
    
    # Default to last 30 days if no date range provided
    if not date_from:
        date_from = datetime.now().date() - timedelta(days=30)
    if not date_to:
        date_to = datetime.now().date()
    
    # Total patients
    total_patients = db.query(func.count(Patient.id)).filter(
        Patient.is_active == True
    ).scalar()
    
    # Studies in date range
    studies_query = db.query(Study).filter(
        and_(
            Study.study_date >= date_from,
            Study.study_date <= date_to
        )
    )
    
    total_studies = studies_query.count()
    completed_studies = studies_query.filter(Study.status == "COMPLETED").count()
    
    # Analysis results statistics
    analysis_stats = db.query(
        AnalysisResult.predicted_class,
        func.count(AnalysisResult.id).label('count'),
        func.avg(AnalysisResult.confidence_score).label('avg_confidence')
    ).join(Study).filter(
        and_(
            Study.study_date >= date_from,
            Study.study_date <= date_to
        )
    ).group_by(AnalysisResult.predicted_class).all()
    
    # Fibrosis stage distribution
    fibrosis_stats = db.query(
        AnalysisResult.fibrosis_stage,
        func.count(AnalysisResult.id).label('count')
    ).join(Study).filter(
        and_(
            Study.study_date >= date_from,
            Study.study_date <= date_to,
            AnalysisResult.fibrosis_stage.isnot(None)
        )
    ).group_by(AnalysisResult.fibrosis_stage).all()
    
    # High-risk cases requiring review
    high_risk_cases = db.query(func.count(AnalysisResult.id)).filter(
        AnalysisResult.requires_review == True,
        AnalysisResult.analysis_timestamp >= date_from
    ).scalar()
    
    return {
        "total_patients": total_patients,
        "total_studies": total_studies,
        "completed_studies": completed_studies,
        "completion_rate": (completed_studies / total_studies * 100) if total_studies > 0 else 0,
        "analysis_distribution": [
            {"class": result.predicted_class, "count": result.count, "avg_confidence": float(result.avg_confidence)}
            for result in analysis_stats
        ],
        "fibrosis_distribution": [
            {"stage": result.fibrosis_stage, "count": result.count}
            for result in fibrosis_stats
        ],
        "high_risk_cases": high_risk_cases,
        "period": {"from": date_from.isoformat(), "to": date_to.isoformat()}
    }
