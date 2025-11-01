import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
from typing import Tuple, Dict, Any, Optional, List
import open_clip
from transformers import AutoModelForImageClassification, AutoImageProcessor
from scipy.stats import entropy
import logging

logger = logging.getLogger(__name__)

class ClinicalGradeFibrosisModel(nn.Module):
    """
    Enhanced fibrosis prediction model with uncertainty quantification and clinical validation.
    Implements Monte Carlo Dropout and Deep Ensembles for epistemic uncertainty estimation.
    """
    
    def __init__(self, 
                 pretrained: str = "openai", 
                 model_name: str = "ViT-B-32",
                 num_ensemble_models: int = 5,
                 dropout_rate: float = 0.15,
                 uncertainty_threshold: float = 0.3):
        super().__init__()
        
        # Core CLIP model for feature extraction
        self.clip_model, _, self.preprocess = open_clip.create_model_and_transforms(
            model_name, pretrained=pretrained
        )
        
        # Freeze CLIP weights initially
        for param in self.clip_model.parameters():
            param.requires_grad = False
        
        # Enhanced regression head with uncertainty estimation
        self.feature_dim = self.clip_model.visual.output_dim
        self.metadata_dim = 3  # view_type one-hot encoding
        
        # Ensemble of prediction heads
        self.num_ensemble = num_ensemble_models
        self.ensemble_heads = nn.ModuleList([
            self._create_prediction_head() for _ in range(num_ensemble_models)
        ])
        
        # Uncertainty estimation components
        self.uncertainty_threshold = uncertainty_threshold
        self.dropout_rate = dropout_rate
        
        # Clinical validation parameters
        self.clinical_ranges = {
            'F0': (0.0, 7.0),    # Normal: 0-7 kPa
            'F1': (5.5, 9.5),   # Mild fibrosis: 5.5-9.5 kPa
            'F2': (7.0, 11.5),  # Moderate fibrosis: 7.0-11.5 kPa
            'F3': (9.5, 17.0),  # Severe fibrosis: 9.5-17.0 kPa
            'F4': (13.0, 75.0)  # Cirrhosis: >13.0 kPa
        }
        
        # Quality assessment network
        self.quality_assessor = self._create_quality_network()
        
    def _create_prediction_head(self) -> nn.Module:
        """Create individual prediction head for ensemble."""
        return nn.Sequential(
            nn.Linear(self.feature_dim + self.metadata_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(self.dropout_rate),
            
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(self.dropout_rate),
            
            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(self.dropout_rate),
            
            # Dual output: mean and log variance for aleatoric uncertainty
            nn.Linear(128, 2)  # [mean, log_var]
        )
    
    def _create_quality_network(self) -> nn.Module:
        """Network to assess image quality and detect artifacts."""
        return nn.Sequential(
            nn.Linear(self.feature_dim, 256),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(256, 128),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(128, 4),  # [quality_score, blur_score, noise_score, artifact_score]
            nn.Sigmoid()
        )
    
    def forward(self, 
                image: torch.Tensor, 
                metadata: torch.Tensor,
                enable_uncertainty: bool = True,
                num_mc_samples: int = 50) -> Dict[str, torch.Tensor]:
        """
        Forward pass with uncertainty quantification.
        
        Args:
            image: Input ultrasound image tensor
            metadata: View type metadata (one-hot encoded)
            enable_uncertainty: Whether to compute uncertainty estimates
            num_mc_samples: Number of Monte Carlo samples for epistemic uncertainty
            
        Returns:
            Dictionary containing predictions and uncertainty estimates
        """
        # Extract image features using CLIP
        with torch.no_grad():
            image_features = self.clip_model.encode_image(image)
            image_features = F.normalize(image_features, p=2, dim=-1)
        
        # Quality assessment
        quality_scores = self.quality_assessor(image_features)
        
        # Combine image features with metadata
        combined_features = torch.cat([image_features, metadata], dim=-1)
        
        if not enable_uncertainty:
            # Single forward pass for inference speed
            ensemble_outputs = []
            for head in self.ensemble_heads:
                output = head(combined_features)
                mean_pred = output[:, 0]
                ensemble_outputs.append(mean_pred)
            
            ensemble_mean = torch.stack(ensemble_outputs).mean(dim=0)
            ensemble_std = torch.stack(ensemble_outputs).std(dim=0)
            
            return {
                'te_prediction': ensemble_mean,
                'epistemic_uncertainty': ensemble_std,
                'quality_scores': quality_scores
            }
        
        # Full uncertainty quantification
        mc_predictions = []
        aleatoric_vars = []
        
        # Monte Carlo Dropout for epistemic uncertainty
        self.train()  # Enable dropout during inference
        
        for _ in range(num_mc_samples):
            ensemble_mc_preds = []
            ensemble_aleatoric = []
            
            for head in self.ensemble_heads:
                output = head(combined_features)
                mean_pred = output[:, 0]
                log_var = output[:, 1]
                
                ensemble_mc_preds.append(mean_pred)
                ensemble_aleatoric.append(torch.exp(log_var))
            
            # Average across ensemble for this MC sample
            mc_mean = torch.stack(ensemble_mc_preds).mean(dim=0)
            mc_aleatoric = torch.stack(ensemble_aleatoric).mean(dim=0)
            
            mc_predictions.append(mc_mean)
            aleatoric_vars.append(mc_aleatoric)
        
        self.eval()  # Return to eval mode
        
        # Compute final uncertainties
        mc_predictions = torch.stack(mc_predictions)  # [num_samples, batch_size]
        aleatoric_vars = torch.stack(aleatoric_vars)
        
        # Prediction statistics
        predictive_mean = mc_predictions.mean(dim=0)
        epistemic_uncertainty = mc_predictions.var(dim=0)
        aleatoric_uncertainty = aleatoric_vars.mean(dim=0)
        
        # Total uncertainty (epistemic + aleatoric)
        total_uncertainty = epistemic_uncertainty + aleatoric_uncertainty
        
        return {
            'te_prediction': predictive_mean,
            'epistemic_uncertainty': epistemic_uncertainty,
            'aleatoric_uncertainty': aleatoric_uncertainty,
            'total_uncertainty': total_uncertainty,
            'quality_scores': quality_scores,
            'prediction_interval': self._compute_prediction_interval(
                predictive_mean, total_uncertainty
            )
        }
    
    def _compute_prediction_interval(self, 
                                   mean: torch.Tensor, 
                                   uncertainty: torch.Tensor,
                                   confidence: float = 0.95) -> Dict[str, torch.Tensor]:
        """Compute prediction intervals based on uncertainty estimates."""
        # Assume Gaussian distribution for simplicity
        # In practice, you might want to use calibrated intervals
        z_score = 1.96 if confidence == 0.95 else 2.58  # 95% or 99% confidence
        
        std = torch.sqrt(uncertainty)
        lower = mean - z_score * std
        upper = mean + z_score * std
        
        # Ensure physical constraints (TE values should be positive)
        lower = torch.clamp(lower, min=0.0)
        
        return {
            'lower': lower,
            'upper': upper,
            'confidence_level': confidence
        }
    
    def predict_with_clinical_validation(self, 
                                       image: torch.Tensor,
                                       metadata: torch.Tensor,
                                       swe_stage: Optional[str] = None) -> Dict[str, Any]:
        """
        Make prediction with clinical validation and interpretation.
        
        Args:
            image: Input ultrasound image
            metadata: View type metadata
            swe_stage: Optional SWE stage for clamping
            
        Returns:
            Clinical prediction with interpretation and recommendations
        """
        # Get model predictions with uncertainty
        predictions = self.forward(image, metadata, enable_uncertainty=True)
        
        te_pred = predictions['te_prediction'].cpu().numpy()
        epistemic_unc = predictions['epistemic_uncertainty'].cpu().numpy()
        aleatoric_unc = predictions['aleatoric_uncertainty'].cpu().numpy()
        quality = predictions['quality_scores'].cpu().numpy()
        
        results = []
        for i in range(len(te_pred)):
            # Apply SWE clamping if provided
            clamped_te = self._apply_swe_clamping(te_pred[i], swe_stage)
            
            # Determine fibrosis stage
            fibrosis_stage = self._te_to_stage(clamped_te)
            
            # Clinical interpretation
            interpretation = self._generate_clinical_interpretation(
                clamped_te, fibrosis_stage, epistemic_unc[i], aleatoric_unc[i], quality[i]
            )
            
            # Risk assessment
            risk_assessment = self._assess_clinical_risk(
                clamped_te, fibrosis_stage, epistemic_unc[i], quality[i]
            )
            
            result = {
                'predicted_te_kpa': float(te_pred[i]),
                'clamped_te_kpa': float(clamped_te),
                'fibrosis_stage': fibrosis_stage,
                'epistemic_uncertainty': float(epistemic_unc[i]),
                'aleatoric_uncertainty': float(aleatoric_unc[i]),
                'confidence_score': float(1.0 / (1.0 + epistemic_unc[i])),  # Convert uncertainty to confidence
                'image_quality': {
                    'overall_quality': float(quality[i][0]),
                    'blur_assessment': float(quality[i][1]),
                    'noise_level': float(quality[i][2]),
                    'artifact_detection': float(quality[i][3])
                },
                'clinical_interpretation': interpretation,
                'risk_assessment': risk_assessment,
                'requires_review': risk_assessment['requires_review']
            }
            
            results.append(result)
        
        return results[0] if len(results) == 1 else results
    
    def _apply_swe_clamping(self, te_value: float, swe_stage: Optional[str]) -> float:
        """Apply SWE stage clamping to TE prediction."""
        if not swe_stage or swe_stage == "Unknown":
            return te_value
        
        stage_ranges = {
            'F0': (0.0, 7.0),
            'F1': (5.5, 9.5),
            'F2': (7.0, 11.5),
            'F3': (9.5, 17.0),
            'F4': (13.0, 75.0)
        }
        
        if swe_stage in stage_ranges:
            min_val, max_val = stage_ranges[swe_stage]
            return np.clip(te_value, min_val, max_val)
        
        return te_value
    
    def _te_to_stage(self, te_value: float) -> str:
        """Convert TE value to fibrosis stage."""
        if te_value < 7.0:
            return 'F0'
        elif te_value < 9.5:
            return 'F1'
        elif te_value < 11.5:
            return 'F2'
        elif te_value < 17.0:
            return 'F3'
        else:
            return 'F4'
    
    def _generate_clinical_interpretation(self, 
                                        te_value: float,
                                        stage: str,
                                        epistemic_unc: float,
                                        aleatoric_unc: float,
                                        quality: np.ndarray) -> Dict[str, str]:
        """Generate clinical interpretation of results."""
        
        # Base interpretation by stage
        stage_interpretations = {
            'F0': "Normal liver stiffness. No significant fibrosis detected.",
            'F1': "Mild liver fibrosis. Consider monitoring and addressing underlying causes.",
            'F2': "Moderate liver fibrosis. Clinical follow-up recommended.",
            'F3': "Severe liver fibrosis. Specialist consultation advised.",
            'F4': "Cirrhosis detected. Immediate specialist referral recommended."
        }
        
        base_interpretation = stage_interpretations.get(stage, "Indeterminate stage.")
        
        # Add uncertainty considerations
        confidence_level = "high" if epistemic_unc < 0.2 else "moderate" if epistemic_unc < 0.4 else "low"
        
        # Quality considerations
        quality_assessment = "excellent" if quality[0] > 0.8 else "good" if quality[0] > 0.6 else "fair" if quality[0] > 0.4 else "poor"
        
        detailed_interpretation = f"{base_interpretation} "
        detailed_interpretation += f"Prediction confidence: {confidence_level}. "
        detailed_interpretation += f"Image quality: {quality_assessment}."
        
        if quality[3] > 0.5:  # High artifact score
            detailed_interpretation += " Significant artifacts detected - consider repeat imaging."
        
        return {
            'primary': base_interpretation,
            'detailed': detailed_interpretation,
            'confidence_level': confidence_level,
            'quality_assessment': quality_assessment
        }
    
    def _assess_clinical_risk(self, 
                            te_value: float,
                            stage: str,
                            epistemic_unc: float,
                            quality: np.ndarray) -> Dict[str, Any]:
        """Assess clinical risk and need for review."""
        
        # High-risk conditions
        high_risk_conditions = []
        requires_review = False
        urgency = "routine"
        
        # Stage-based risk
        if stage in ['F3', 'F4']:
            high_risk_conditions.append("Advanced fibrosis/cirrhosis")
            requires_review = True
            urgency = "urgent" if stage == 'F4' else "priority"
        
        # Uncertainty-based risk
        if epistemic_unc > self.uncertainty_threshold:
            high_risk_conditions.append("High prediction uncertainty")
            requires_review = True
        
        # Quality-based risk
        if quality[0] < 0.5:  # Poor overall quality
            high_risk_conditions.append("Poor image quality")
            requires_review = True
        
        if quality[3] > 0.7:  # High artifact detection
            high_risk_conditions.append("Significant imaging artifacts")
            requires_review = True
        
        # Borderline cases between stages
        stage_boundaries = [7.0, 9.5, 11.5, 17.0]
        for boundary in stage_boundaries:
            if abs(te_value - boundary) < 1.0:  # Within 1 kPa of boundary
                high_risk_conditions.append("Borderline fibrosis stage")
                requires_review = True
                break
        
        # Risk level
        if stage == 'F4':
            risk_level = "critical"
        elif stage == 'F3' or len(high_risk_conditions) >= 2:
            risk_level = "high"
        elif len(high_risk_conditions) == 1:
            risk_level = "moderate"
        else:
            risk_level = "low"
        
        return {
            'risk_level': risk_level,
            'requires_review': requires_review,
            'urgency': urgency,
            'risk_factors': high_risk_conditions,
            'recommended_actions': self._get_recommended_actions(stage, high_risk_conditions)
        }
    
    def _get_recommended_actions(self, stage: str, risk_factors: List[str]) -> List[str]:
        """Get recommended clinical actions based on stage and risk factors."""
        actions = []
        
        # Stage-based recommendations
        if stage == 'F0':
            actions.append("Continue routine monitoring")
        elif stage == 'F1':
            actions.extend([
                "Address underlying liver disease causes",
                "Lifestyle modifications",
                "Follow-up in 6-12 months"
            ])
        elif stage == 'F2':
            actions.extend([
                "Hepatology consultation recommended",
                "Investigate underlying etiology",
                "Consider treatment initiation",
                "Follow-up in 3-6 months"
            ])
        elif stage == 'F3':
            actions.extend([
                "Urgent hepatology referral",
                "HCC surveillance initiation",
                "Antiviral therapy if indicated",
                "Follow-up in 3 months"
            ])
        elif stage == 'F4':
            actions.extend([
                "Immediate hepatology consultation",
                "HCC surveillance program",
                "Liver transplant evaluation",
                "Variceal screening",
                "Regular monitoring"
            ])
        
        # Risk factor-based recommendations
        if "High prediction uncertainty" in risk_factors:
            actions.append("Consider repeat imaging or alternative assessment")
        
        if "Poor image quality" in risk_factors or "Significant imaging artifacts" in risk_factors:
            actions.append("Repeat ultrasound with optimal technique")
        
        if "Borderline fibrosis stage" in risk_factors:
            actions.append("Consider additional non-invasive assessment (e.g., MR elastography)")
        
        return actions


class EnhancedClassificationModel(nn.Module):
    """
    Enhanced liver condition classification model with uncertainty quantification
    and clinical-grade accuracy improvements.
    """
    
    def __init__(self, 
                 model_name: str = "timm/maxvit_large_tf_224.in1k",
                 num_classes: int = 7,
                 dropout_rate: float = 0.2,
                 use_test_time_augmentation: bool = True):
        super().__init__()
        
        # Base model
        self.processor = AutoImageProcessor.from_pretrained(model_name)
        self.model = AutoModelForImageClassification.from_pretrained(
            model_name,
            num_labels=num_classes,
            ignore_mismatched_sizes=True
        )
        
        # Replace classifier head with uncertainty-aware version
        self.feature_dim = self.model.classifier.in_features
        self.model.classifier = nn.Identity()  # Remove original classifier
        
        # Enhanced classifier with uncertainty estimation
        self.classifier = nn.Sequential(
            nn.Dropout(dropout_rate),
            nn.Linear(self.feature_dim, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(512, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(dropout_rate),
            nn.Linear(256, num_classes)
        )
        
        # Temperature scaling for calibration
        self.temperature = nn.Parameter(torch.ones(1) * 1.5)
        
        self.use_tta = use_test_time_augmentation
        self.num_classes = num_classes
        
        # Class mapping with clinical significance
        self.class_mapping = {
            0: {'name': 'FFC', 'clinical_significance': 'low', 'urgency': 'routine'},
            1: {'name': 'FFS', 'clinical_significance': 'low', 'urgency': 'routine'},
            2: {'name': 'HCC', 'clinical_significance': 'critical', 'urgency': 'stat'},
            3: {'name': 'Cyst', 'clinical_significance': 'low', 'urgency': 'routine'},
            4: {'name': 'Hemangioma', 'clinical_significance': 'low', 'urgency': 'routine'},
            5: {'name': 'Dysplastic Nodule', 'clinical_significance': 'high', 'urgency': 'urgent'},
            6: {'name': 'CCA', 'clinical_significance': 'critical', 'urgency': 'stat'}
        }
    
    def forward(self, 
                image: torch.Tensor,
                enable_uncertainty: bool = True,
                num_mc_samples: int = 30) -> Dict[str, torch.Tensor]:
        """Forward pass with uncertainty quantification."""
        
        if not enable_uncertainty:
            # Single forward pass
            features = self.model(image).logits
            logits = self.classifier(features)
            calibrated_logits = logits / self.temperature
            probabilities = F.softmax(calibrated_logits, dim=-1)
            
            return {
                'logits': calibrated_logits,
                'probabilities': probabilities,
                'predicted_class': torch.argmax(probabilities, dim=-1)
            }
        
        # Monte Carlo Dropout for uncertainty estimation
        self.train()  # Enable dropout during inference
        
        mc_predictions = []
        for _ in range(num_mc_samples):
            features = self.model(image).logits
            logits = self.classifier(features)
            calibrated_logits = logits / self.temperature
            probabilities = F.softmax(calibrated_logits, dim=-1)
            mc_predictions.append(probabilities)
        
        self.eval()  # Return to eval mode
        
        # Compute uncertainty metrics
        mc_predictions = torch.stack(mc_predictions)  # [num_samples, batch_size, num_classes]
        
        # Predictive mean
        mean_probabilities = mc_predictions.mean(dim=0)
        predicted_class = torch.argmax(mean_probabilities, dim=-1)
        
        # Epistemic uncertainty (mutual information)
        epistemic_uncertainty = self._compute_epistemic_uncertainty(mc_predictions)
        
        # Aleatoric uncertainty (entropy of mean prediction)
        aleatoric_uncertainty = self._compute_aleatoric_uncertainty(mean_probabilities)
        
        # Total uncertainty
        total_uncertainty = epistemic_uncertainty + aleatoric_uncertainty
        
        return {
            'probabilities': mean_probabilities,
            'predicted_class': predicted_class,
            'epistemic_uncertainty': epistemic_uncertainty,
            'aleatoric_uncertainty': aleatoric_uncertainty,
            'total_uncertainty': total_uncertainty,
            'prediction_variance': mc_predictions.var(dim=0)
        }
    
    def _compute_epistemic_uncertainty(self, mc_predictions: torch.Tensor) -> torch.Tensor:
        """Compute epistemic uncertainty using mutual information."""
        # Expected entropy
        mean_probs = mc_predictions.mean(dim=0)
        expected_entropy = -torch.sum(mean_probs * torch.log(mean_probs + 1e-8), dim=-1)
        
        # Entropy of expected
        sample_entropies = -torch.sum(mc_predictions * torch.log(mc_predictions + 1e-8), dim=-1)
        entropy_of_expected = sample_entropies.mean(dim=0)
        
        # Mutual information (epistemic uncertainty)
        mutual_info = expected_entropy - entropy_of_expected
        return mutual_info
    
    def _compute_aleatoric_uncertainty(self, probabilities: torch.Tensor) -> torch.Tensor:
        """Compute aleatoric uncertainty as entropy of mean prediction."""
        return -torch.sum(probabilities * torch.log(probabilities + 1e-8), dim=-1)
    
    def predict_with_clinical_context(self, 
                                    image: torch.Tensor,
                                    patient_age: Optional[int] = None,
                                    patient_gender: Optional[str] = None,
                                    clinical_history: Optional[str] = None) -> Dict[str, Any]:
        """Make prediction with clinical context and interpretation."""
        
        # Get model predictions
        predictions = self.forward(image, enable_uncertainty=True)
        
        probabilities = predictions['probabilities'].cpu().numpy()[0]
        predicted_class = int(predictions['predicted_class'].cpu().numpy()[0])
        epistemic_unc = float(predictions['epistemic_uncertainty'].cpu().numpy()[0])
        aleatoric_unc = float(predictions['aleatoric_uncertainty'].cpu().numpy()[0])
        
        # Get class information
        class_info = self.class_mapping[predicted_class]
        confidence_score = float(probabilities[predicted_class])
        
        # Clinical interpretation
        interpretation = self._generate_clinical_interpretation(
            predicted_class, confidence_score, epistemic_unc, 
            patient_age, patient_gender, clinical_history
        )
        
        # Risk assessment
        risk_assessment = self._assess_classification_risk(
            predicted_class, confidence_score, epistemic_unc
        )
        
        # All class probabilities for transparency
        class_probabilities = {
            self.class_mapping[i]['name']: float(probabilities[i])
            for i in range(self.num_classes)
        }
        
        return {
            'predicted_class': class_info['name'],
            'confidence_score': confidence_score,
            'class_probabilities': class_probabilities,
            'epistemic_uncertainty': epistemic_unc,
            'aleatoric_uncertainty': aleatoric_unc,
            'clinical_significance': class_info['clinical_significance'],
            'recommended_urgency': class_info['urgency'],
            'clinical_interpretation': interpretation,
            'risk_assessment': risk_assessment,
            'requires_review': risk_assessment['requires_review']
        }
    
    def _generate_clinical_interpretation(self, 
                                        predicted_class: int,
                                        confidence: float,
                                        uncertainty: float,
                                        patient_age: Optional[int],
                                        patient_gender: Optional[str],
                                        clinical_history: Optional[str]) -> Dict[str, str]:
        """Generate clinical interpretation with context."""
        
        class_name = self.class_mapping[predicted_class]['name']
        
        # Base interpretations
        interpretations = {
            'FFC': "Focal fatty change detected. Usually benign but may indicate underlying metabolic conditions.",
            'FFS': "Focal fatty sparing identified. Typically benign finding in patients with fatty liver disease.",
            'HCC': "CRITICAL: Hepatocellular carcinoma suspected. Immediate oncology consultation required.",
            'Cyst': "Liver cyst detected. Usually benign but may require monitoring for size changes.",
            'Hemangioma': "Liver hemangioma identified. Benign vascular lesion, typically requires no treatment.",
            'Dysplastic Nodule': "Dysplastic nodule detected. Precancerous lesion requiring urgent specialist evaluation.",
            'CCA': "CRITICAL: Cholangiocarcinoma suspected. Immediate oncology consultation required."
        }
        
        base_interpretation = interpretations.get(class_name, "Unknown liver lesion detected.")
        
        # Add confidence and uncertainty context
        confidence_level = "high" if confidence > 0.8 else "moderate" if confidence > 0.6 else "low"
        uncertainty_level = "low" if uncertainty < 0.3 else "moderate" if uncertainty < 0.6 else "high"
        
        detailed_interpretation = f"{base_interpretation} "
        detailed_interpretation += f"AI confidence: {confidence_level} ({confidence:.1%}). "
        detailed_interpretation += f"Prediction uncertainty: {uncertainty_level}."
        
        # Add contextual information
        if patient_age and predicted_class == 2:  # HCC
            if patient_age > 50:
                detailed_interpretation += " Age >50 increases HCC risk - urgent evaluation critical."
        
        if predicted_class in [2, 6]:  # HCC or CCA
            detailed_interpretation += " This finding requires IMMEDIATE clinical correlation and specialist referral."
        
        return {
            'primary': base_interpretation,
            'detailed': detailed_interpretation,
            'confidence_level': confidence_level,
            'uncertainty_level': uncertainty_level
        }
    
    def _assess_classification_risk(self, 
                                  predicted_class: int,
                                  confidence: float,
                                  uncertainty: float) -> Dict[str, Any]:
        """Assess clinical risk based on classification results."""
        
        class_info = self.class_mapping[predicted_class]
        risk_factors = []
        requires_review = False
        
        # Critical conditions always require review
        if class_info['clinical_significance'] == 'critical':
            risk_factors.append("Critical pathology detected")
            requires_review = True
        
        # High uncertainty requires review
        if uncertainty > 0.5:
            risk_factors.append("High prediction uncertainty")
            requires_review = True
        
        # Low confidence requires review
        if confidence < 0.7:
            risk_factors.append("Low prediction confidence")
            requires_review = True
        
        # High-significance conditions with moderate confidence
        if class_info['clinical_significance'] == 'high' and confidence < 0.8:
            risk_factors.append("High-significance condition with moderate confidence")
            requires_review = True
        
        # Risk level assessment
        if class_info['clinical_significance'] == 'critical':
            risk_level = "critical"
        elif class_info['clinical_significance'] == 'high' or len(risk_factors) >= 2:
            risk_level = "high"
        elif len(risk_factors) == 1:
            risk_level = "moderate"
        else:
            risk_level = "low"
        
        return {
            'risk_level': risk_level,
            'requires_review': requires_review,
            'recommended_urgency': class_info['urgency'],
            'risk_factors': risk_factors,
            'recommended_actions': self._get_classification_actions(predicted_class, risk_factors)
        }
    
    def _get_classification_actions(self, predicted_class: int, risk_factors: List[str]) -> List[str]:
        """Get recommended actions based on classification."""
        
        class_name = self.class_mapping[predicted_class]['name']
        actions = []
        
        if class_name in ['HCC', 'CCA']:
            actions.extend([
                "STAT oncology consultation",
                "Urgent CT/MRI with contrast",
                "Tumor markers (AFP, CA 19-9)",
                "Multidisciplinary team review"
            ])
        elif class_name == 'Dysplastic Nodule':
            actions.extend([
                "Urgent hepatology consultation",
                "Enhanced surveillance protocol",
                "Consider biopsy if indicated",
                "3-month follow-up imaging"
            ])
        elif class_name in ['FFC', 'FFS']:
            actions.extend([
                "Evaluate for metabolic syndrome",
                "Liver function tests",
                "Consider lifestyle modifications",
                "Routine follow-up"
            ])
        else:  # Cyst, Hemangioma
            actions.extend([
                "Routine monitoring",
                "Consider follow-up imaging in 6-12 months",
                "No immediate intervention required"
            ])
        
        # Risk factor-based actions
        if "High prediction uncertainty" in risk_factors or "Low prediction confidence" in risk_factors:
            actions.append("Consider repeat imaging or expert review")
        
        return actions
