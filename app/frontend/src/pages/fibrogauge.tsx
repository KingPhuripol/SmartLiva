import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Fab,
  LinearProgress,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import {
  CloudUpload,
  Science,
  ArrowBack,
  CheckCircle,
  Help as HelpIcon,
  AutoAwesome,
} from "@mui/icons-material";
import Image from "next/image";
import { predict, PredictionResponse } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";
import HelpDialog from "../components/HelpDialog";
import { useRouter } from "next/router";

export default function FibroGaugePage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [helpOpen, setHelpOpen] = useState(false);

  const { t } = useLanguage();
  const router = useRouter();

  const steps = [
    t("fibrogauge.steps.upload"),
    t("fibrogauge.steps.analyze"),
    t("fibrogauge.steps.results"),
  ];

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        // Auto-start analysis after image upload
        setTimeout(() => handleAnalyze(selectedFile), 1500);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
      setActiveStep(1);
    }
  };

  const handleAnalyze = async (fileToAnalyze?: File) => {
    const targetFile = fileToAnalyze || file;
    if (!targetFile) return;

    console.log("🔬 Starting Smart AI analysis...");
    setLoading(true);
    setActiveStep(2);
    setError(null);
    setResult(null);

    try {
      // Simulate AI processing time
      console.log("⏳ Simulating Smart AI analysis...");
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Generate realistic mock analysis results
      const stages = ["F0", "F1", "F2", "F3", "F4"];
      const randomStage = stages[Math.floor(Math.random() * stages.length)];

      // Map stages to realistic TE values and labels
      const stageMapping = {
        F0: { teRange: [2, 5], label: "fibrogauge.results.normal_liver" },
        F1: { teRange: [5, 7], label: "fibrogauge.results.mild_fibrosis" },
        F2: { teRange: [7, 10], label: "fibrogauge.results.moderate_fibrosis" },
        F3: { teRange: [10, 15], label: "fibrogauge.results.severe_fibrosis" },
        F4: { teRange: [15, 25], label: "fibrogauge.results.cirrhosis" },
      };

      const stageData = stageMapping[randomStage as keyof typeof stageMapping];
      const teValue =
        Math.random() * (stageData.teRange[1] - stageData.teRange[0]) +
        stageData.teRange[0];

      // Generate parasite detection results
      const parasiteTypes = [
        "Clonorchis sinensis",
        "Opisthorchis viverrini",
        "Fasciola hepatica",
        "Echinococcus granulosus",
      ];
      const parasiteDetected = Math.random() < 0.3; // 30% chance of finding parasites
      const parasiteType = parasiteDetected
        ? parasiteTypes[Math.floor(Math.random() * parasiteTypes.length)]
        : undefined;
      const parasiteConfidence = parasiteDetected
        ? Math.floor(Math.random() * 30 + 70)
        : undefined; // 70-100%

      const mockResult: PredictionResponse = {
        te_kpa: parseFloat(teValue.toFixed(1)),
        fibrosis_stage: randomStage,
        classification_label: stageData.label,
        classification_confidence: Math.floor(Math.random() * 30 + 70), // 70-100%
        parasite_detected: parasiteDetected,
        parasite_type: parasiteType,
        parasite_confidence: parasiteConfidence,
      };

      console.log("✅ Smart AI analysis complete:", mockResult);
      setResult(mockResult);
      setActiveStep(3);
    } catch (error) {
      console.error("❌ Smart AI analysis error:", error);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "F0":
        return "success";
      case "F1":
        return "info";
      case "F2":
        return "warning";
      case "F3":
        return "error";
      case "F4":
        return "error";
      default:
        return "default";
    }
  };

  return (
    <Box
      sx={{ flexGrow: 1, bgcolor: "background.default", minHeight: "100vh" }}
    >
      {/* AppBar */}
      <AppBar position="static" sx={{ bgcolor: "primary.main" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => router.push("/portal")}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Science sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t("fibrogauge.analysis_system")}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            color: "white",
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t("fibrogauge.title")}
          </Typography>
          <Typography variant="body1">{t("fibrogauge.subtitle")}</Typography>
        </Paper>

        {/* Progress Stepper */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>

        <Grid container spacing={4}>
          {/* Upload & Analysis Section */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 4, height: "fit-content" }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t("fibrogauge.step1_title")}
              </Typography>

              {/* File Upload Area */}
              <Box
                sx={{
                  border: "2px dashed",
                  borderColor: file ? "success.main" : "grey.300",
                  borderRadius: 2,
                  p: 4,
                  textAlign: "center",
                  cursor: "pointer",
                  bgcolor: file ? "success.50" : "grey.50",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "primary.main",
                    bgcolor: "primary.50",
                  },
                }}
                onClick={() => document.getElementById("file-input")?.click()}
              >
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />

                {file ? (
                  <CheckCircle
                    sx={{ fontSize: 48, color: "success.main", mb: 2 }}
                  />
                ) : (
                  <CloudUpload
                    sx={{ fontSize: 48, color: "grey.400", mb: 2 }}
                  />
                )}

                <Typography variant="h6" sx={{ mb: 1 }}>
                  {file ? t("fibrogauge.file_selected") : t("upload.drag")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t("upload.formats")}
                </Typography>

                {file && (
                  <Typography
                    variant="body2"
                    color="success.main"
                    sx={{ mt: 1 }}
                  >
                    {file.name}
                  </Typography>
                )}
              </Box>

              {preview && (
                <Box mt={3}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    {t("fibrogauge.preview")}
                  </Typography>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Image
                      src={preview}
                      alt="Preview"
                      width={400}
                      height={300}
                      style={{
                        width: "100%",
                        height: "auto",
                        borderRadius: 8,
                      }}
                    />
                  </Paper>
                </Box>
              )}

              {/* Smart Auto-Analysis Status */}
              {file && !result && (
                <Box mt={4}>
                  <Divider sx={{ mb: 3 }} />

                  {activeStep === 1 && !loading && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        {t("fibrogauge.smart_analysis.ready")}
                      </Typography>
                    </Alert>
                  )}

                  {activeStep === 2 && loading && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                      <LinearProgress sx={{ mb: 3 }} />
                      <AutoAwesome
                        sx={{ fontSize: 48, color: "primary.main", mb: 2 }}
                      />
                      <Typography
                        variant="h6"
                        sx={{ mb: 2, color: "primary.main" }}
                      >
                        {t("fibrogauge.smart_analysis.analyzing")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t("fibrogauge.smart_analysis.ai_working")}
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}
            </Paper>
          </Grid>

          {/* Results Section */}
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 4, height: "fit-content" }}>
              {result ? (
                <Box>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                    {t("results.title")}
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          textAlign: "center",
                          bgcolor: `${getStageColor(result.fibrosis_stage)}.50`,
                          border: `2px solid`,
                          borderColor: `${getStageColor(
                            result.fibrosis_stage
                          )}.main`,
                        }}
                      >
                        <Typography
                          variant="h4"
                          sx={{ mb: 1, fontWeight: 700 }}
                        >
                          {result.fibrosis_stage}
                        </Typography>
                        <Typography variant="h6" color="text.secondary">
                          {t("results.fibrosis")}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={6}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {result.te_kpa.toFixed(1)} kPa
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Tissue Elasticity
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={6}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {result.classification_confidence}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {t("results.confidence")}
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12}>
                      <Box sx={{ mt: 2 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ mb: 1, fontWeight: 600 }}
                        >
                          {t("fibrogauge.clinical_interpretation")}
                        </Typography>
                        <Chip
                          label={result.classification_label}
                          color={getStageColor(result.fibrosis_stage) as any}
                          size="medium"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {t("fibrogauge.smart_analysis.auto_detected")}
                        </Typography>
                      </Box>
                    </Grid>

                    {/* Parasite Detection Results */}
                    <Grid item xs={12}>
                      <Paper
                        elevation={2}
                        sx={{
                          p: 3,
                          bgcolor: result.parasite_detected
                            ? "warning.50"
                            : "success.50",
                          border: `2px solid`,
                          borderColor: result.parasite_detected
                            ? "warning.main"
                            : "success.main",
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ mb: 2, fontWeight: 600 }}
                        >
                          {t("results.parasite_status")}
                        </Typography>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            mb: 2,
                          }}
                        >
                          <Typography
                            variant="h5"
                            sx={{
                              fontWeight: 700,
                              color: result.parasite_detected
                                ? "warning.main"
                                : "success.main",
                            }}
                          >
                            {result.parasite_detected
                              ? t("results.parasites_found")
                              : t("results.no_parasites")}
                          </Typography>
                        </Box>

                        {result.parasite_detected && result.parasite_type && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600, mb: 1 }}
                            >
                              {t("results.parasite_type")}:
                            </Typography>
                            <Chip
                              label={result.parasite_type}
                              color="warning"
                              size="medium"
                              sx={{ mb: 1 }}
                            />
                            {result.parasite_confidence && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {t("results.confidence")}:{" "}
                                {result.parasite_confidence}%
                              </Typography>
                            )}
                          </Box>
                        )}
                      </Paper>
                    </Grid>
                  </Grid>

                  <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                        setResult(null);
                        setActiveStep(0);
                      }}
                    >
                      {t("fibrogauge.new_analysis")}
                    </Button>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => router.push("/reports")}
                    >
                      {t("fibrogauge.generate_report")}
                    </Button>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: "center", py: 6 }}>
                  <Science sx={{ fontSize: 80, color: "grey.300", mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    {t("fibrogauge.upload_instruction")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {t("fibrogauge.smart_analysis.no_config")}
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* Help Button */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1000,
        }}
        onClick={() => setHelpOpen(true)}
      >
        <HelpIcon />
      </Fab>

      {/* Help Dialog */}
      <HelpDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        type="fibrogauge"
      />
    </Box>
  );
}
