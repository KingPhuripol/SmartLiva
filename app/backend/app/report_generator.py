from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image as RLImage, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch, cm
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

import io
import base64
from datetime import datetime, timezone
from typing import Dict, Any, Optional, List
import hashlib
import qrcode
from PIL import Image
import numpy as np

class MedicalReportGenerator:
    """
    Professional medical report generator for liver ultrasound analysis.
    Generates HIPAA-compliant, clinically-formatted PDF reports with digital signatures.
    """
    
    def __init__(self, hospital_info: Dict[str, str]):
        self.hospital_info = hospital_info
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()
    
    def _setup_custom_styles(self):
        """Setup custom paragraph styles for medical reports."""
        
        # Header style
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceAfter=30,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # Hospital header style
        self.styles.add(ParagraphStyle(
            name='HospitalHeader',
            parent=self.styles['Normal'],
            fontSize=12,
            alignment=TA_CENTER,
            spaceAfter=20
        ))
        
        # Section header style
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.darkblue,
            borderWidth=1,
            borderColor=colors.lightgrey,
            borderPadding=5
        ))
        
        # Clinical finding style
        self.styles.add(ParagraphStyle(
            name='ClinicalFinding',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            leftIndent=20
        ))
        
        # Critical finding style
        self.styles.add(ParagraphStyle(
            name='CriticalFinding',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=8,
            leftIndent=20,
            textColor=colors.red,
            borderWidth=1,
            borderColor=colors.red,
            borderPadding=5
        ))
        
        # AI annotation style
        self.styles.add(ParagraphStyle(
            name='AIAnnotation',
            parent=self.styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
            fontName='Helvetica-Oblique',
            spaceAfter=5
        ))
    
    def generate_comprehensive_report(self, 
                                    patient_data: Dict[str, Any],
                                    study_data: Dict[str, Any],
                                    analysis_results: Dict[str, Any],
                                    doctor_data: Dict[str, Any],
                                    images: Optional[List[bytes]] = None) -> bytes:
        """
        Generate a comprehensive medical report with all clinical findings.
        
        Args:
            patient_data: Patient demographic and medical information
            study_data: Study details and clinical indication
            analysis_results: AI analysis results with uncertainty quantification
            doctor_data: Physician information for signatures
            images: Optional list of ultrasound images to include
            
        Returns:
            PDF report as bytes
        """
        
        # Create PDF buffer
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=2*cm,
            leftMargin=2*cm,
            topMargin=2*cm,
            bottomMargin=2*cm
        )
        
        # Build report content
        story = []
        
        # Header
        story.extend(self._build_header())
        
        # Patient demographics
        story.extend(self._build_patient_section(patient_data))
        
        # Study information
        story.extend(self._build_study_section(study_data))
        
        # Clinical findings
        story.extend(self._build_findings_section(analysis_results))
        
        # AI analysis details
        story.extend(self._build_ai_analysis_section(analysis_results))
        
        # Images (if provided)
        if images:
            story.extend(self._build_images_section(images))
        
        # Impression and recommendations
        story.extend(self._build_impression_section(analysis_results))
        
        # Digital signature section
        story.extend(self._build_signature_section(doctor_data, analysis_results))
        
        # QR code for verification
        story.extend(self._build_verification_section(patient_data, study_data))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    
    def _build_header(self) -> List:
        """Build report header with hospital information."""
        elements = []
        
        # Hospital name and logo (if available)
        hospital_header = f"""
        <b>{self.hospital_info.get('name', 'Medical Center')}</b><br/>
        {self.hospital_info.get('address', '')}<br/>
        Phone: {self.hospital_info.get('phone', '')} | Email: {self.hospital_info.get('email', '')}<br/>
        License: {self.hospital_info.get('license', '')}
        """
        elements.append(Paragraph(hospital_header, self.styles['HospitalHeader']))
        
        # Report title
        elements.append(Paragraph(
            "<b>LIVER ULTRASOUND ANALYSIS REPORT</b>", 
            self.styles['CustomTitle']
        ))
        
        # AI assistance disclaimer
        elements.append(Paragraph(
            "<i>This report includes AI-assisted analysis - Clinical correlation required</i>", 
            self.styles['AIAnnotation']
        ))
        
        elements.append(Spacer(1, 20))
        return elements
    
    def _build_patient_section(self, patient_data: Dict[str, Any]) -> List:
        """Build patient demographics section."""
        elements = []
        
        elements.append(Paragraph("PATIENT INFORMATION", self.styles['SectionHeader']))
        
        # Patient demographics table
        patient_info = [
            ['Patient Name:', f"{patient_data.get('first_name', '')} {patient_data.get('last_name', '')}"],
            ['Hospital Number:', patient_data.get('hospital_number', '')],
            ['Date of Birth:', patient_data.get('date_of_birth', '')],
            ['Age:', str(self._calculate_age(patient_data.get('date_of_birth', '')))],
            ['Gender:', patient_data.get('gender', '')],
            ['Phone:', patient_data.get('phone', '')],
        ]
        
        patient_table = Table(patient_info, colWidths=[4*cm, 8*cm])
        patient_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(patient_table)
        elements.append(Spacer(1, 15))
        
        # Medical history (if available)
        if patient_data.get('medical_history'):
            elements.append(Paragraph("Medical History:", self.styles['Normal']))
            elements.append(Paragraph(
                patient_data['medical_history'], 
                self.styles['ClinicalFinding']
            ))
        
        # Current medications
        if patient_data.get('current_medications'):
            elements.append(Paragraph("Current Medications:", self.styles['Normal']))
            elements.append(Paragraph(
                patient_data['current_medications'], 
                self.styles['ClinicalFinding']
            ))
        
        # Allergies
        if patient_data.get('allergies'):
            elements.append(Paragraph("Allergies:", self.styles['Normal']))
            elements.append(Paragraph(
                patient_data['allergies'], 
                self.styles['ClinicalFinding']
            ))
        
        elements.append(Spacer(1, 20))
        return elements
    
    def _build_study_section(self, study_data: Dict[str, Any]) -> List:
        """Build study information section."""
        elements = []
        
        elements.append(Paragraph("STUDY INFORMATION", self.styles['SectionHeader']))
        
        study_info = [
            ['Study ID:', study_data.get('study_id', '')],
            ['Study Date:', study_data.get('study_date', '')],
            ['Modality:', study_data.get('modality', 'Ultrasound')],
            ['Body Part:', study_data.get('body_part', 'Liver')],
            ['Referring Physician:', study_data.get('referring_physician', '')],
            ['Clinical Indication:', study_data.get('clinical_indication', '')],
            ['Urgency Level:', study_data.get('urgency_level', 'Routine')],
        ]
        
        study_table = Table(study_info, colWidths=[4*cm, 8*cm])
        study_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEBELOW', (0, -1), (-1, -1), 1, colors.black)
        ]))
        
        elements.append(study_table)
        elements.append(Spacer(1, 20))
        return elements
    
    def _build_findings_section(self, analysis_results: Dict[str, Any]) -> List:
        """Build clinical findings section."""
        elements = []
        
        elements.append(Paragraph("CLINICAL FINDINGS", self.styles['SectionHeader']))
        
        # Fibrosis analysis
        fibrosis_data = analysis_results.get('fibrosis_analysis', {})
        if fibrosis_data:
            elements.append(Paragraph("<b>Liver Stiffness Assessment:</b>", self.styles['Normal']))
            
            te_value = fibrosis_data.get('clamped_te_kpa', fibrosis_data.get('predicted_te_kpa', 0))
            stage = fibrosis_data.get('fibrosis_stage', 'Unknown')
            confidence = fibrosis_data.get('confidence_score', 0)
            
            finding_text = f"""
            Transient Elastography (TE) equivalent: {te_value:.1f} kPa<br/>
            Fibrosis Stage: <b>{stage}</b><br/>
            Assessment Confidence: {confidence:.1%}
            """
            
            # Use critical style for advanced fibrosis
            style = self.styles['CriticalFinding'] if stage in ['F3', 'F4'] else self.styles['ClinicalFinding']
            elements.append(Paragraph(finding_text, style))
            
            # Clinical interpretation
            interpretation = fibrosis_data.get('clinical_interpretation', {})
            if interpretation:
                elements.append(Paragraph(
                    f"<b>Interpretation:</b> {interpretation.get('detailed', '')}", 
                    self.styles['ClinicalFinding']
                ))
        
        elements.append(Spacer(1, 15))
        
        # Classification analysis
        classification_data = analysis_results.get('classification_analysis', {})
        if classification_data:
            elements.append(Paragraph("<b>Liver Lesion Analysis:</b>", self.styles['Normal']))
            
            predicted_class = classification_data.get('predicted_class', 'Unknown')
            confidence = classification_data.get('confidence_score', 0)
            significance = classification_data.get('clinical_significance', 'unknown')
            
            finding_text = f"""
            Primary Finding: <b>{predicted_class}</b><br/>
            Confidence Level: {confidence:.1%}<br/>
            Clinical Significance: {significance.upper()}
            """
            
            # Use critical style for malignant findings
            style = self.styles['CriticalFinding'] if significance == 'critical' else self.styles['ClinicalFinding']
            elements.append(Paragraph(finding_text, style))
            
            # All class probabilities for transparency
            class_probs = classification_data.get('class_probabilities', {})
            if class_probs:
                prob_text = "<b>Differential Diagnosis Probabilities:</b><br/>"
                for class_name, prob in sorted(class_probs.items(), key=lambda x: x[1], reverse=True):
                    prob_text += f"• {class_name}: {prob:.1%}<br/>"
                
                elements.append(Paragraph(prob_text, self.styles['ClinicalFinding']))
        
        elements.append(Spacer(1, 20))
        return elements
    
    def _build_ai_analysis_section(self, analysis_results: Dict[str, Any]) -> List:
        """Build AI analysis technical details section."""
        elements = []
        
        elements.append(Paragraph("AI ANALYSIS DETAILS", self.styles['SectionHeader']))
        
        # Model information
        model_info = f"""
        <b>Analysis Models:</b><br/>
        • Fibrosis Assessment: Enhanced CLIP-based elastography estimation<br/>
        • Classification: MaxViT-Large with uncertainty quantification<br/>
        • Processing Time: {analysis_results.get('processing_time_ms', 0)}ms<br/>
        • Analysis Timestamp: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}
        """
        
        elements.append(Paragraph(model_info, self.styles['ClinicalFinding']))
        
        # Uncertainty quantification
        elements.append(Paragraph("<b>Uncertainty Analysis:</b>", self.styles['Normal']))
        
        fibrosis_data = analysis_results.get('fibrosis_analysis', {})
        classification_data = analysis_results.get('classification_analysis', {})
        
        uncertainty_table_data = [
            ['Analysis Type', 'Epistemic Uncertainty', 'Aleatoric Uncertainty', 'Confidence Level'],
        ]
        
        if fibrosis_data:
            uncertainty_table_data.append([
                'Fibrosis Assessment',
                f"{fibrosis_data.get('epistemic_uncertainty', 0):.3f}",
                f"{fibrosis_data.get('aleatoric_uncertainty', 0):.3f}",
                fibrosis_data.get('clinical_interpretation', {}).get('confidence_level', 'Unknown')
            ])
        
        if classification_data:
            uncertainty_table_data.append([
                'Lesion Classification',
                f"{classification_data.get('epistemic_uncertainty', 0):.3f}",
                f"{classification_data.get('aleatoric_uncertainty', 0):.3f}",
                classification_data.get('clinical_interpretation', {}).get('confidence_level', 'Unknown')
            ])
        
        uncertainty_table = Table(uncertainty_table_data, colWidths=[4*cm, 3*cm, 3*cm, 3*cm])
        uncertainty_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightblue),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        elements.append(uncertainty_table)
        
        # Quality assessment
        quality_data = analysis_results.get('image_quality', {})
        if quality_data:
            elements.append(Spacer(1, 10))
            elements.append(Paragraph("<b>Image Quality Assessment:</b>", self.styles['Normal']))
            
            quality_text = f"""
            Overall Quality Score: {quality_data.get('overall_quality', 0):.1%}<br/>
            Blur Assessment: {quality_data.get('blur_assessment', 0):.1%}<br/>
            Noise Level: {quality_data.get('noise_level', 0):.1%}<br/>
            Artifact Detection: {quality_data.get('artifact_detection', 0):.1%}
            """
            
            elements.append(Paragraph(quality_text, self.styles['ClinicalFinding']))
        
        elements.append(Spacer(1, 20))
        return elements
    
    def _build_images_section(self, images: List[bytes]) -> List:
        """Build ultrasound images section."""
        elements = []
        
        elements.append(PageBreak())
        elements.append(Paragraph("ULTRASOUND IMAGES", self.styles['SectionHeader']))
        
        for i, image_bytes in enumerate(images[:4]):  # Maximum 4 images
            try:
                # Convert bytes to PIL Image
                img = Image.open(io.BytesIO(image_bytes))
                
                # Resize if necessary
                max_width, max_height = 400, 300
                img.thumbnail((max_width, max_height), Image.Resampling.LANCZOS)
                
                # Convert to ReportLab Image
                img_buffer = io.BytesIO()
                img.save(img_buffer, format='PNG')
                img_buffer.seek(0)
                
                rl_image = RLImage(img_buffer, width=img.width, height=img.height)
                
                elements.append(Paragraph(f"<b>Image {i+1}:</b>", self.styles['Normal']))
                elements.append(rl_image)
                elements.append(Spacer(1, 15))
                
            except Exception as e:
                elements.append(Paragraph(f"Error loading image {i+1}: {str(e)}", self.styles['Normal']))
        
        return elements
    
    def _build_impression_section(self, analysis_results: Dict[str, Any]) -> List:
        """Build clinical impression and recommendations section."""
        elements = []
        
        elements.append(Paragraph("IMPRESSION", self.styles['SectionHeader']))
        
        # Combine findings for overall impression
        fibrosis_data = analysis_results.get('fibrosis_analysis', {})
        classification_data = analysis_results.get('classification_analysis', {})
        
        # Primary impression
        impression_parts = []
        
        if fibrosis_data:
            stage = fibrosis_data.get('fibrosis_stage', 'Unknown')
            te_value = fibrosis_data.get('clamped_te_kpa', 0)
            
            if stage == 'F0':
                impression_parts.append(f"1. Normal liver stiffness (TE {te_value:.1f} kPa) - No significant fibrosis.")
            elif stage == 'F1':
                impression_parts.append(f"2. Mild liver fibrosis (TE {te_value:.1f} kPa) - Stage F1.")
            elif stage == 'F2':
                impression_parts.append(f"3. Moderate liver fibrosis (TE {te_value:.1f} kPa) - Stage F2.")
            elif stage == 'F3':
                impression_parts.append(f"4. Severe liver fibrosis (TE {te_value:.1f} kPa) - Stage F3.")
            elif stage == 'F4':
                impression_parts.append(f"5. Liver cirrhosis (TE {te_value:.1f} kPa) - Stage F4.")
        
        if classification_data:
            predicted_class = classification_data.get('predicted_class', 'Unknown')
            confidence = classification_data.get('confidence_score', 0)
            significance = classification_data.get('clinical_significance', 'unknown')
            
            if significance == 'critical':
                impression_parts.append(f"⚠️ CRITICAL FINDING: {predicted_class} detected (confidence: {confidence:.1%})")
            elif significance == 'high':
                impression_parts.append(f"🔍 Significant finding: {predicted_class} identified (confidence: {confidence:.1%})")
            else:
                impression_parts.append(f"📋 Liver finding: {predicted_class} noted (confidence: {confidence:.1%})")
        
        # Format impression
        impression_text = "<br/>".join(impression_parts)
        
        # Use critical style if any critical findings
        has_critical = any('CRITICAL' in part for part in impression_parts)
        style = self.styles['CriticalFinding'] if has_critical else self.styles['ClinicalFinding']
        
        elements.append(Paragraph(impression_text, style))
        
        elements.append(Spacer(1, 15))
        
        # Recommendations
        elements.append(Paragraph("RECOMMENDATIONS", self.styles['SectionHeader']))
        
        recommendations = []
        
        # Collect recommendations from analysis
        if fibrosis_data.get('risk_assessment', {}).get('recommended_actions'):
            recommendations.extend(fibrosis_data['risk_assessment']['recommended_actions'])
        
        if classification_data.get('risk_assessment', {}).get('recommended_actions'):
            recommendations.extend(classification_data['risk_assessment']['recommended_actions'])
        
        # Add general recommendations if none provided
        if not recommendations:
            recommendations = [
                "Clinical correlation with patient history and laboratory findings",
                "Follow-up as clinically indicated",
                "Consider additional imaging if symptoms persist"
            ]
        
        # Format recommendations
        rec_text = ""
        for i, rec in enumerate(recommendations, 1):
            rec_text += f"{i}. {rec}<br/>"
        
        elements.append(Paragraph(rec_text, self.styles['ClinicalFinding']))
        
        # AI disclaimer
        elements.append(Spacer(1, 15))
        elements.append(Paragraph(
            "<i><b>Important Note:</b> This report includes AI-assisted analysis. "
            "All findings must be clinically correlated and verified by a qualified physician. "
            "The AI analysis is intended to assist, not replace, clinical judgment.</i>", 
            self.styles['AIAnnotation']
        ))
        
        elements.append(Spacer(1, 20))
        return elements
    
    def _build_signature_section(self, doctor_data: Dict[str, Any], analysis_results: Dict[str, Any]) -> List:
        """Build digital signature section."""
        elements = []
        
        elements.append(Paragraph("PHYSICIAN SIGNATURE", self.styles['SectionHeader']))
        
        # Physician information
        physician_info = f"""
        <b>Reporting Physician:</b><br/>
        Dr. {doctor_data.get('first_name', '')} {doctor_data.get('last_name', '')}<br/>
        {doctor_data.get('specialization', '')}<br/>
        License Number: {doctor_data.get('license_number', '')}<br/>
        Department: {doctor_data.get('department', '')}<br/>
        """
        
        elements.append(Paragraph(physician_info, self.styles['ClinicalFinding']))
        
        # Signature information
        signature_info = [
            ['Report Date:', datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ['Digital Signature:', self._generate_signature_hash(analysis_results, doctor_data)[:16] + '...'],
            ['Report Status:', 'FINAL'],
            ['Verification Code:', self._generate_verification_code(analysis_results)],
        ]
        
        signature_table = Table(signature_info, colWidths=[4*cm, 8*cm])
        signature_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('GRID', (0, 0), (-1, -1), 1, colors.lightgrey),
        ]))
        
        elements.append(signature_table)
        elements.append(Spacer(1, 20))
        
        return elements
    
    def _build_verification_section(self, patient_data: Dict[str, Any], study_data: Dict[str, Any]) -> List:
        """Build QR code verification section."""
        elements = []
        
        # Generate verification data
        verification_data = {
            'patient_id': patient_data.get('hospital_number', ''),
            'study_id': study_data.get('study_id', ''),
            'report_date': datetime.now().isoformat(),
            'hospital': self.hospital_info.get('name', ''),
        }
        
        # Create QR code
        qr_text = f"VERIFY:{verification_data['study_id']}:{verification_data['report_date'][:10]}"
        qr = qrcode.QRCode(version=1, box_size=3, border=1)
        qr.add_data(qr_text)
        qr.make(fit=True)
        
        qr_img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to ReportLab image
        qr_buffer = io.BytesIO()
        qr_img.save(qr_buffer, format='PNG')
        qr_buffer.seek(0)
        
        # Layout QR code and verification text
        verification_table = Table([
            ['Report Verification:', 'Scan QR code to verify report authenticity'],
            ['', RLImage(qr_buffer, width=2*cm, height=2*cm)],
        ], colWidths=[4*cm, 8*cm])
        
        verification_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('SPAN', (1, 0), (1, 0)),
        ]))
        
        elements.append(verification_table)
        
        # Footer
        elements.append(Spacer(1, 15))
        elements.append(Paragraph(
            f"<i>This report was generated by SmartLiva AI-Assisted Liver Analysis System v2.0<br/>"
            f"Report ID: {study_data.get('study_id', '')}<br/>"
            f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}</i>", 
            self.styles['AIAnnotation']
        ))
        
        return elements
    
    def _calculate_age(self, date_of_birth: str) -> int:
        """Calculate age from date of birth."""
        try:
            if isinstance(date_of_birth, str):
                birth_date = datetime.strptime(date_of_birth, '%Y-%m-%d').date()
            else:
                birth_date = date_of_birth
            
            today = datetime.now().date()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
            return age
        except:
            return 0
    
    def _generate_signature_hash(self, analysis_results: Dict[str, Any], doctor_data: Dict[str, Any]) -> str:
        """Generate digital signature hash for report integrity."""
        # Create signature content
        signature_content = {
            'doctor_id': doctor_data.get('id', ''),
            'license_number': doctor_data.get('license_number', ''),
            'analysis_results': analysis_results,
            'timestamp': datetime.now().isoformat(),
        }
        
        # Generate hash
        content_str = str(signature_content)
        return hashlib.sha256(content_str.encode()).hexdigest()
    
    def _generate_verification_code(self, analysis_results: Dict[str, Any]) -> str:
        """Generate verification code for report authenticity."""
        # Create verification content
        verification_content = {
            'fibrosis_stage': analysis_results.get('fibrosis_analysis', {}).get('fibrosis_stage', ''),
            'predicted_class': analysis_results.get('classification_analysis', {}).get('predicted_class', ''),
            'timestamp': datetime.now().strftime('%Y%m%d'),
        }
        
        # Generate short verification code
        content_str = str(verification_content)
        hash_digest = hashlib.md5(content_str.encode()).hexdigest()
        return hash_digest[:8].upper()


class ReportTemplateManager:
    """
    Manages different report templates for various clinical scenarios.
    """
    
    def __init__(self):
        self.templates = {
            'standard': self._standard_template,
            'screening': self._screening_template,
            'follow_up': self._follow_up_template,
            'urgent': self._urgent_template,
            'research': self._research_template,
        }
    
    def get_template(self, template_type: str) -> Dict[str, Any]:
        """Get report template configuration."""
        return self.templates.get(template_type, self._standard_template)()
    
    def _standard_template(self) -> Dict[str, Any]:
        """Standard clinical report template."""
        return {
            'include_sections': [
                'patient_demographics',
                'study_information',
                'clinical_findings',
                'ai_analysis',
                'images',
                'impression',
                'recommendations',
                'signature',
                'verification'
            ],
            'image_limit': 4,
            'include_uncertainty': True,
            'include_probabilities': True,
            'clinical_level': 'standard'
        }
    
    def _screening_template(self) -> Dict[str, Any]:
        """Simplified screening report template."""
        return {
            'include_sections': [
                'patient_demographics',
                'study_information',
                'clinical_findings',
                'impression',
                'recommendations',
                'signature'
            ],
            'image_limit': 2,
            'include_uncertainty': False,
            'include_probabilities': False,
            'clinical_level': 'simplified'
        }
    
    def _follow_up_template(self) -> Dict[str, Any]:
        """Follow-up comparison report template."""
        return {
            'include_sections': [
                'patient_demographics',
                'study_information',
                'clinical_findings',
                'comparison_analysis',
                'trend_analysis',
                'impression',
                'recommendations',
                'signature'
            ],
            'image_limit': 6,
            'include_uncertainty': True,
            'include_probabilities': True,
            'clinical_level': 'comparative'
        }
    
    def _urgent_template(self) -> Dict[str, Any]:
        """Urgent/STAT report template with critical findings highlighted."""
        return {
            'include_sections': [
                'patient_demographics',
                'critical_alert',
                'study_information',
                'clinical_findings',
                'ai_analysis',
                'images',
                'urgent_impression',
                'immediate_actions',
                'signature'
            ],
            'image_limit': 4,
            'include_uncertainty': True,
            'include_probabilities': True,
            'clinical_level': 'urgent'
        }
    
    def _research_template(self) -> Dict[str, Any]:
        """Research report template with detailed technical information."""
        return {
            'include_sections': [
                'patient_demographics',
                'study_information',
                'clinical_findings',
                'detailed_ai_analysis',
                'model_performance',
                'uncertainty_analysis',
                'images',
                'technical_notes',
                'impression',
                'research_notes',
                'signature'
            ],
            'image_limit': 8,
            'include_uncertainty': True,
            'include_probabilities': True,
            'clinical_level': 'research'
        }
