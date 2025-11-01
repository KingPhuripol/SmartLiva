import { useState, useEffect } from "react";
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
  Card,
  CardContent,
  CardActions,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Fab,
  Avatar,
  Divider,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  ArrowBack,
  Add as AddIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Create as SignatureIcon,
  CloudDownload as CloudDownloadIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";
import HelpDialog from "../components/HelpDialog";
import { useRouter } from "next/router";

interface ClinicalReport {
  id: string;
  patientId: string;
  patientName: string;
  reportType: "fibrogauge" | "hepasage" | "comprehensive";
  title: string;
  status: "draft" | "completed" | "signed" | "archived";
  createdDate: Date;
  lastModified: Date;
  createdBy: string;
  signedBy?: string;
  signedDate?: Date;
  findings: string;
  recommendations: string;
  attachments: string[];
}

export default function ClinicalReportsPage() {
  const [reports, setReports] = useState<ClinicalReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<ClinicalReport | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [reportTypeFilter, setReportTypeFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [newReport, setNewReport] = useState<Partial<ClinicalReport>>({
    reportType: "fibrogauge",
    status: "draft",
  });

  const { t } = useLanguage();
  const router = useRouter();

  // Mock data for demonstration
  useEffect(() => {
    const mockReports: ClinicalReport[] = [
      {
        id: "RPT-001",
        patientId: "PT-001",
        patientName: "สมชาย ใจดี",
        reportType: "fibrogauge",
        title: "FibroGauge™ Liver Fibrosis Analysis",
        status: "signed",
        createdDate: new Date("2024-03-15"),
        lastModified: new Date("2024-03-16"),
        createdBy: "Dr. Smith",
        signedBy: "Dr. Johnson",
        signedDate: new Date("2024-03-16"),
        findings: "F2 Moderate fibrosis detected. Liver stiffness: 10.5 kPa",
        recommendations:
          "Regular monitoring recommended. Follow-up in 6 months.",
        attachments: ["ultrasound_001.jpg", "analysis_report.pdf"],
      },
      {
        id: "RPT-002",
        patientId: "PT-002",
        patientName: "Anna Mueller",
        reportType: "comprehensive",
        title: "Comprehensive Liver Health Assessment",
        status: "completed",
        createdDate: new Date("2024-03-14"),
        lastModified: new Date("2024-03-14"),
        createdBy: "Dr. Brown",
        findings:
          "Normal liver function. No significant abnormalities detected.",
        recommendations:
          "Maintain healthy lifestyle. Annual check-up recommended.",
        attachments: ["lab_results.pdf"],
      },
      {
        id: "RPT-003",
        patientId: "PT-003",
        patientName: "John Smith",
        reportType: "hepasage",
        title: "HepaSage™ Consultation Summary",
        status: "draft",
        createdDate: new Date("2024-03-13"),
        lastModified: new Date("2024-03-13"),
        createdBy: "Dr. Wilson",
        findings: "Patient consultation regarding liver health concerns.",
        recommendations: "Further diagnostic tests recommended.",
        attachments: [],
      },
    ];
    setReports(mockReports);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "default";
      case "completed":
        return "primary";
      case "signed":
        return "success";
      case "archived":
        return "secondary";
      default:
        return "default";
    }
  };

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "fibrogauge":
        return "primary";
      case "hepasage":
        return "secondary";
      case "comprehensive":
        return "success";
      default:
        return "default";
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType =
      reportTypeFilter === "all" || report.reportType === reportTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateReport = () => {
    const reportId = `RPT-${String(reports.length + 1).padStart(3, "0")}`;
    const newReportData: ClinicalReport = {
      id: reportId,
      patientId: newReport.patientId || "",
      patientName: newReport.patientName || "",
      reportType: newReport.reportType as
        | "fibrogauge"
        | "hepasage"
        | "comprehensive",
      title: newReport.title || "",
      status: "draft",
      createdDate: new Date(),
      lastModified: new Date(),
      createdBy: "Current User",
      findings: newReport.findings || "",
      recommendations: newReport.recommendations || "",
      attachments: [],
    };

    setReports([...reports, newReportData]);
    setDialogOpen(false);
    setNewReport({ reportType: "fibrogauge", status: "draft" });
  };

  const handleSignReport = (reportId: string) => {
    setLoading(true);
    setTimeout(() => {
      setReports(
        reports.map((report) =>
          report.id === reportId
            ? {
                ...report,
                status: "signed" as const,
                signedBy: "Current User",
                signedDate: new Date(),
              }
            : report
        )
      );
      setLoading(false);
    }, 2000);
  };

  const handleDownloadPDF = (report: ClinicalReport) => {
    // Mock PDF generation
    console.log(`Generating PDF for report ${report.id}`);
    alert(`PDF for ${report.title} would be downloaded`);
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
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {t("reports.title")}
          </Typography>
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Paper
          sx={{
            p: 3,
            mb: 3,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Typography variant="h4" gutterBottom>
            {t("reports.header.title")}
          </Typography>
          <Typography variant="body1">
            {t("reports.header.subtitle")}
          </Typography>
        </Paper>

        {/* Search and Filter Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder={t("reports.search.placeholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <SearchIcon sx={{ color: "text.secondary", mr: 1 }} />
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label={t("reports.filter.status")}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">{t("reports.filter.all")}</MenuItem>
                <MenuItem value="draft">{t("reports.status.draft")}</MenuItem>
                <MenuItem value="completed">
                  {t("reports.status.completed")}
                </MenuItem>
                <MenuItem value="signed">{t("reports.status.signed")}</MenuItem>
                <MenuItem value="archived">
                  {t("reports.status.archived")}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <TextField
                select
                fullWidth
                label={t("reports.filter.type")}
                value={reportTypeFilter}
                onChange={(e) => setReportTypeFilter(e.target.value)}
              >
                <MenuItem value="all">{t("reports.filter.all")}</MenuItem>
                <MenuItem value="fibrogauge">FibroGauge™</MenuItem>
                <MenuItem value="hepasage">HepaSage™</MenuItem>
                <MenuItem value="comprehensive">
                  {t("reports.type.comprehensive")}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setDialogOpen(true)}
                fullWidth
              >
                {t("reports.create.button")}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Reports Table */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell>
                  <strong>{t("reports.table.id")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("reports.table.patient")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("reports.table.type")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("reports.table.title")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("reports.table.status")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("reports.table.created")}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t("reports.table.actions")}</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} hover>
                  <TableCell>{report.id}</TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        {report.patientName.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight="bold">
                          {report.patientName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.patientId}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={report.reportType.toUpperCase()}
                      color={getReportTypeColor(report.reportType) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{report.title}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`reports.status.${report.status}`)}
                      color={getStatusColor(report.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {report.createdDate.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedReport(report);
                          setReportDialogOpen(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadPDF(report)}
                      >
                        <PdfIcon />
                      </IconButton>
                      {report.status !== "signed" && (
                        <IconButton
                          size="small"
                          onClick={() => handleSignReport(report.id)}
                          disabled={loading}
                        >
                          <SignatureIcon />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {filteredReports.length === 0 && (
          <Paper sx={{ p: 4, textAlign: "center", mt: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {t("reports.no_results")}
            </Typography>
          </Paper>
        )}
      </Container>

      {/* Create Report Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{t("reports.create.title")}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("reports.create.patient_id")}
                value={newReport.patientId || ""}
                onChange={(e) =>
                  setNewReport({ ...newReport, patientId: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("reports.create.patient_name")}
                value={newReport.patientName || ""}
                onChange={(e) =>
                  setNewReport({ ...newReport, patientName: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label={t("reports.create.type")}
                value={newReport.reportType || "fibrogauge"}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    reportType: e.target.value as any,
                  })
                }
              >
                <MenuItem value="fibrogauge">FibroGauge™</MenuItem>
                <MenuItem value="hepasage">HepaSage™</MenuItem>
                <MenuItem value="comprehensive">
                  {t("reports.type.comprehensive")}
                </MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("reports.create.title")}
                value={newReport.title || ""}
                onChange={(e) =>
                  setNewReport({ ...newReport, title: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("reports.create.findings")}
                value={newReport.findings || ""}
                onChange={(e) =>
                  setNewReport({ ...newReport, findings: e.target.value })
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("reports.create.recommendations")}
                value={newReport.recommendations || ""}
                onChange={(e) =>
                  setNewReport({
                    ...newReport,
                    recommendations: e.target.value,
                  })
                }
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreateReport} variant="contained">
            {t("reports.create.save")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Report Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="lg"
        fullWidth
      >
        {selectedReport && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">{selectedReport.title}</Typography>
                <Chip
                  label={t(`reports.status.${selectedReport.status}`)}
                  color={getStatusColor(selectedReport.status) as any}
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("reports.table.patient")}
                  </Typography>
                  <Typography variant="body1">
                    {selectedReport.patientName} ({selectedReport.patientId})
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {t("reports.table.created")}
                  </Typography>
                  <Typography variant="body1">
                    {selectedReport.createdDate.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("reports.details.findings")}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedReport.findings}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    gutterBottom
                  >
                    {t("reports.details.recommendations")}
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {selectedReport.recommendations}
                  </Typography>
                </Grid>
                {selectedReport.signedBy && (
                  <Grid item xs={12}>
                    <Alert severity="success">
                      {t("reports.signed_by")}: {selectedReport.signedBy} -{" "}
                      {selectedReport.signedDate?.toLocaleString()}
                    </Alert>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setReportDialogOpen(false)}>
                {t("common.close")}
              </Button>
              <Button
                onClick={() => handleDownloadPDF(selectedReport)}
                startIcon={<PdfIcon />}
              >
                {t("reports.download_pdf")}
              </Button>
              {selectedReport.status !== "signed" && (
                <Button
                  onClick={() => handleSignReport(selectedReport.id)}
                  startIcon={<SignatureIcon />}
                  variant="contained"
                  disabled={loading}
                >
                  {t("reports.sign")}
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

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

      {loading && <LinearProgress />}
    </Box>
  );
}
