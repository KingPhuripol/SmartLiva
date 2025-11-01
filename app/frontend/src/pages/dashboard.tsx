import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  TextField,
  MenuItem,
  LinearProgress,
  Divider,
  Chip,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ScienceIcon from "@mui/icons-material/Science";
import ChatIcon from "@mui/icons-material/Chat";
import Image from "next/image";
import { predict, PredictionResponse } from "../lib/api";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Dashboard() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [viewType, setViewType] = useState("Intercostal");
  const [sweStage, setSweStage] = useState("Unknown");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Use the enhanced language context
  const { currentLanguage, t } = useLanguage();

  const handleSubmit = async () => {
    if (!file) {
      setError("Please select an image");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("view_type", viewType);
      form.append("swe_stage", sweStage);
      const data = await predict(form);
      setResult(data);
    } catch (e: any) {
      setError(e.response?.data?.detail || "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const viewTypeOptions = [
    "Intercostal",
    "Subcostal",
    "Epigastric",
    "Left lateral",
  ];

  const sweStageOptions = [
    "Unknown",
    "F0 (2-7 kPa)",
    "F1 (7-9.5 kPa)",
    "F2 (9.5-12.5 kPa)",
    "F3 (12.5-14.5 kPa)",
    "F4 (>14.5 kPa)",
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa", py: 4 }}>
      <Container maxWidth="lg">
        {/* Header with Language Switcher */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={4}
        >
          <Typography variant="h3" sx={{ fontWeight: 700, color: "#1976d2" }}>
            {t("app.title")}
          </Typography>
          <LanguageSwitcher />
        </Box>

        <Typography
          variant="h6"
          sx={{ mb: 4, color: "text.secondary", textAlign: "center" }}
        >
          {t("app.subtitle")}
        </Typography>

        <Grid container spacing={4}>
          {/* Left Column - FibroGauge Analysis */}
          <Grid item xs={12} lg={8}>
            <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
              <Box display="flex" alignItems="center" mb={3}>
                <ScienceIcon sx={{ mr: 2, color: "#1976d2", fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {t("analysis.fibrosis_title")}
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    sx={{
                      border: "2px dashed #ccc",
                      borderRadius: 2,
                      p: 3,
                      textAlign: "center",
                      cursor: "pointer",
                      "&:hover": { borderColor: "#1976d2", bgcolor: "#f8f9fa" },
                    }}
                    onClick={() =>
                      document.getElementById("file-input")?.click()
                    }
                  >
                    <input
                      id="file-input"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileChange}
                    />
                    <CloudUploadIcon
                      sx={{ fontSize: 48, color: "#ccc", mb: 2 }}
                    />
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {t("upload.drag")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("upload.formats")}
                    </Typography>
                  </Box>

                  {preview && (
                    <Box mt={2}>
                      <Image
                        src={preview}
                        alt="Preview"
                        width={300}
                        height={200}
                        style={{
                          width: "100%",
                          height: "auto",
                          borderRadius: 8,
                        }}
                      />
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label={t("form.view_type")}
                    value={viewType}
                    onChange={(e) => setViewType(e.target.value)}
                    sx={{ mb: 3 }}
                  >
                    {viewTypeOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    fullWidth
                    select
                    label={t("form.swe_stage")}
                    value={sweStage}
                    onChange={(e) => setSweStage(e.target.value)}
                    sx={{ mb: 3 }}
                  >
                    {sweStageOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    fullWidth
                    variant="contained"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!file || loading}
                    startIcon={<ScienceIcon />}
                    sx={{
                      py: 1.5,
                      fontSize: "1.1rem",
                      background:
                        "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
                    }}
                  >
                    {loading ? t("form.analyzing") : t("form.analyze")}
                  </Button>

                  {loading && (
                    <Box mt={2}>
                      <LinearProgress />
                    </Box>
                  )}

                  {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                      {error}
                    </Typography>
                  )}
                </Grid>
              </Grid>

              {/* Results Section */}
              {result && (
                <Box mt={4}>
                  <Divider sx={{ mb: 3 }} />
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                    {t("results.title")}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          TE Value
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {result.te_kpa.toFixed(1)} kPa
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t("results.fibrosis")}
                        </Typography>
                        <Chip
                          label={result.fibrosis_stage}
                          color="primary"
                          sx={{ fontWeight: 600 }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t("results.condition")}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {result.classification_label}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={1} sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="subtitle2" color="text.secondary">
                          {t("results.confidence")}
                        </Typography>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 600,
                            color:
                              result.classification_confidence > 0.8
                                ? "success.main"
                                : result.classification_confidence > 0.6
                                ? "warning.main"
                                : "error.main",
                          }}
                        >
                          {(result.classification_confidence * 100).toFixed(1)}%
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Right Column - HepaSage Chat */}
          <Grid item xs={12} lg={4}>
            <Paper elevation={3} sx={{ p: 4, height: "fit-content" }}>
              <Box display="flex" alignItems="center" mb={3}>
                <ChatIcon sx={{ mr: 2, color: "#1976d2", fontSize: 32 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {t("chat.title")}
                </Typography>
              </Box>

              <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.6 }}>
                {t("chat.subtitle")}
              </Typography>

              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: "#f8f9fa",
                  border: "1px solid #e0e0e0",
                  mb: 3,
                }}
              >
                <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                  💬 {t("chat.example")}
                </Typography>
              </Paper>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<ChatIcon />}
                href="/chat"
                sx={{
                  py: 1.5,
                  fontSize: "1rem",
                  borderWidth: 2,
                  "&:hover": { borderWidth: 2 },
                }}
              >
                {t("chat.try_more")}
              </Button>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
