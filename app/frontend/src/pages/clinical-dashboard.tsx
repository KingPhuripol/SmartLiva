import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  Alert,
  Divider,
  AppBar,
  Toolbar,
} from "@mui/material";
import {
  PersonAdd as PersonAddIcon,
  Assignment as AssignmentIcon,
  Analytics as AnalyticsIcon,
  LocalHospital as HospitalIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Language as LanguageIcon,
} from "@mui/icons-material";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { api } from "../lib/api";

interface Patient {
  id: string;
  hospital_number: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  phone?: string;
  email?: string;
  created_at: string;
}

interface Study {
  id: string;
  study_id: string;
  patient_id: string;
  study_date: string;
  status: string;
  clinical_indication?: string;
  urgency_level: string;
}

interface AnalysisResult {
  id: string;
  predicted_class?: string;
  confidence_score?: number;
  fibrosis_stage?: string;
  predicted_te_kpa?: number;
  requires_review: boolean;
  analysis_timestamp: string;
}

interface DashboardStats {
  total_patients: number;
  total_studies: number;
  completed_studies: number;
  completion_rate: number;
  analysis_distribution: Array<{
    class: string;
    count: number;
    avg_confidence: number;
  }>;
  fibrosis_distribution: Array<{
    stage: string;
    count: number;
  }>;
  high_risk_cases: number;
  period: {
    from: string;
    to: string;
  };
}

export default function ClinicalDashboard() {
  const { t, currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [recentStudies, setRecentStudies] = useState<Study[]>([]);
  const [pendingReviews, setPendingReviews] = useState<AnalysisResult[]>([]);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [openNewPatient, setOpenNewPatient] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // New patient form state
  const [newPatient, setNewPatient] = useState({
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "Male",
    phone: "",
    email: "",
    medical_history: "",
    allergies: "",
    current_medications: "",
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load recent patients
      const patientsResponse = await api.get("/patients?limit=10");
      setPatients(patientsResponse.data);

      // Load recent studies
      const studiesResponse = await api.get("/studies/recent?limit=10");
      setRecentStudies(studiesResponse.data);

      // Load pending reviews
      const reviewsResponse = await api.get("/analysis/pending-review");
      setPendingReviews(reviewsResponse.data);

      // Load dashboard statistics
      const statsResponse = await api.get("/dashboard/stats");
      setDashboardStats(statsResponse.data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    try {
      const response = await api.post("/patients", newPatient);
      setPatients([response.data, ...patients]);
      setOpenNewPatient(false);
      setNewPatient({
        first_name: "",
        last_name: "",
        date_of_birth: "",
        gender: "Male",
        phone: "",
        email: "",
        medical_history: "",
        allergies: "",
        current_medications: "",
      });
    } catch (error) {
      console.error("Error creating patient:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return "success";
      case "IN_PROGRESS":
        return "primary";
      case "SCHEDULED":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "default";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "STAT":
        return "error";
      case "Urgent":
        return "warning";
      case "Routine":
        return "success";
      default:
        return "default";
    }
  };

  const filteredPatients = patients.filter(
    (patient) =>
      patient.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.hospital_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !dashboardStats) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography variant="h6" sx={{ mt: 2, textAlign: "center" }}>
          Loading Clinical Dashboard...
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f7fa" }}>
      {/* Top Navigation Bar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t("app.title")}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LanguageSwitcher />
            <Button color="inherit">{t("nav.logout")}</Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Dashboard Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {t("dashboard.title")}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            {t("dashboard.welcome")}
          </Typography>
        </Box>

        {/* Statistics Cards */}
        {dashboardStats && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <HospitalIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Total Patients</Typography>
                  </Box>
                  <Typography variant="h4" color="primary">
                    {dashboardStats.total_patients.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AssignmentIcon color="secondary" sx={{ mr: 1 }} />
                    <Typography variant="h6">Studies Today</Typography>
                  </Box>
                  <Typography variant="h4" color="secondary">
                    {dashboardStats.completed_studies}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dashboardStats.completion_rate.toFixed(1)}% completion rate
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <WarningIcon color="warning" sx={{ mr: 1 }} />
                    <Typography variant="h6">Needs Review</Typography>
                  </Box>
                  <Typography variant="h4" color="warning.main">
                    {dashboardStats.high_risk_cases}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    High-risk cases
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                    <Typography variant="h6">AI Accuracy</Typography>
                  </Box>
                  <Typography variant="h4" color="success.main">
                    94.2%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Average confidence
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Main Content Tabs */}
        <Paper sx={{ width: "100%" }}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab label="Patient Management" />
            <Tab label="Recent Studies" />
            <Tab label="Pending Reviews" />
            <Tab label="Analytics" />
          </Tabs>

          {/* Patient Management Tab */}
          {activeTab === 0 && (
            <Box sx={{ p: 3 }}>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}
              >
                <TextField
                  placeholder="Search patients..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{ width: 300 }}
                />
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setOpenNewPatient(true)}
                >
                  New Patient
                </Button>
              </Box>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Hospital #</TableCell>
                      <TableCell>Patient Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell>Registered</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {patient.hospital_number}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                              {patient.first_name[0]}
                              {patient.last_name[0]}
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="bold">
                                {patient.first_name} {patient.last_name}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {new Date().getFullYear() -
                            new Date(patient.date_of_birth).getFullYear()}
                        </TableCell>
                        <TableCell>{patient.gender}</TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {patient.phone}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {patient.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(patient.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Recent Studies Tab */}
          {activeTab === 1 && (
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Recent Liver Ultrasound Studies
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Study ID</TableCell>
                      <TableCell>Patient</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Urgency</TableCell>
                      <TableCell>Indication</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentStudies.map((study) => (
                      <TableRow key={study.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {study.study_id}
                          </Typography>
                        </TableCell>
                        <TableCell>{study.patient_id}</TableCell>
                        <TableCell>
                          {new Date(study.study_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={study.status}
                            color={getStatusColor(study.status) as any}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={study.urgency_level}
                            color={getUrgencyColor(study.urgency_level) as any}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            noWrap
                            sx={{ maxWidth: 200 }}
                          >
                            {study.clinical_indication || "Routine screening"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Button size="small" variant="outlined">
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Pending Reviews Tab */}
          {activeTab === 2 && (
            <Box sx={{ p: 3 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                  Cases requiring clinical review due to high-risk findings or
                  low AI confidence scores.
                </Typography>
              </Alert>

              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Analysis ID</TableCell>
                      <TableCell>Predicted Finding</TableCell>
                      <TableCell>Confidence Score</TableCell>
                      <TableCell>Fibrosis Stage</TableCell>
                      <TableCell>TE Value</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingReviews.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {result.id.substring(0, 8)}...
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.predicted_class || "Unknown"}
                            color={
                              result.predicted_class === "HCC"
                                ? "error"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <LinearProgress
                              variant="determinate"
                              value={(result.confidence_score || 0) * 100}
                              sx={{ width: 60, mr: 1 }}
                            />
                            <Typography variant="body2">
                              {((result.confidence_score || 0) * 100).toFixed(
                                1
                              )}
                              %
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={result.fibrosis_stage || "N/A"}
                            color={
                              result.fibrosis_stage === "F4"
                                ? "error"
                                : "default"
                            }
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {result.predicted_te_kpa
                            ? `${result.predicted_te_kpa.toFixed(1)} kPa`
                            : "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={
                              result.requires_review ? "High Risk" : "Low Risk"
                            }
                            color={result.requires_review ? "error" : "success"}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Analytics Tab */}
          {activeTab === 3 && dashboardStats && (
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Condition Distribution
                      </Typography>
                      {dashboardStats.analysis_distribution.map(
                        (item, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography variant="body2">
                                {item.class}
                              </Typography>
                              <Typography variant="body2">
                                {item.count} cases
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (item.count / dashboardStats.total_studies) *
                                100
                              }
                              sx={{ mb: 1 }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Avg. Confidence:{" "}
                              {(item.avg_confidence * 100).toFixed(1)}%
                            </Typography>
                          </Box>
                        )
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Fibrosis Stage Distribution
                      </Typography>
                      {dashboardStats.fibrosis_distribution.map(
                        (item, index) => (
                          <Box key={index} sx={{ mb: 2 }}>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                mb: 1,
                              }}
                            >
                              <Typography variant="body2">
                                Stage {item.stage}
                              </Typography>
                              <Typography variant="body2">
                                {item.count} patients
                              </Typography>
                            </Box>
                            <LinearProgress
                              variant="determinate"
                              value={
                                (item.count / dashboardStats.total_studies) *
                                100
                              }
                              color={item.stage === "F4" ? "error" : "primary"}
                            />
                          </Box>
                        )
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* New Patient Dialog */}
        <Dialog
          open={openNewPatient}
          onClose={() => setOpenNewPatient(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Register New Patient</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={newPatient.first_name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, first_name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={newPatient.last_name}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, last_name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  type="date"
                  value={newPatient.date_of_birth}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      date_of_birth: e.target.value,
                    })
                  }
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Gender"
                  value={newPatient.gender}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, gender: e.target.value })
                  }
                >
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={newPatient.phone}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, phone: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newPatient.email}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, email: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Medical History"
                  value={newPatient.medical_history}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      medical_history: e.target.value,
                    })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Known Allergies"
                  value={newPatient.allergies}
                  onChange={(e) =>
                    setNewPatient({ ...newPatient, allergies: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  multiline
                  rows={2}
                  label="Current Medications"
                  value={newPatient.current_medications}
                  onChange={(e) =>
                    setNewPatient({
                      ...newPatient,
                      current_medications: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenNewPatient(false)}>
              {t("btn.cancel")}
            </Button>
            <Button onClick={handleCreatePatient} variant="contained">
              {t("patients.add")}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
