import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Fade,
  useTheme,
  alpha,
  AppBar,
  Toolbar,
  IconButton,
} from "@mui/material";
import {
  Science,
  Chat,
  Assessment,
  ExitToApp,
  AccountCircle,
} from "@mui/icons-material";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useRouter } from "next/router";

export default function PortalPage() {
  const { t } = useLanguage();
  const theme = useTheme();
  const router = useRouter();

  const services = [
    {
      id: "fibrogauge",
      title: t("portal.fibrogauge.title"),
      description: t("portal.fibrogauge.desc"),
      icon: <Science sx={{ fontSize: 80 }} />,
      color: theme.palette.primary.main,
      route: "/fibrogauge",
      gradient: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    },
    {
      id: "hepasage",
      title: t("portal.hepasage.title"),
      description: t("portal.hepasage.desc"),
      icon: <Chat sx={{ fontSize: 80 }} />,
      color: theme.palette.secondary.main,
      route: "/hepasage",
      gradient: `linear-gradient(135deg, ${theme.palette.secondary.main}, ${theme.palette.secondary.dark})`,
    },
    {
      id: "reports",
      title: t("portal.reports.title"),
      description: t("portal.reports.desc"),
      icon: <Assessment sx={{ fontSize: 80 }} />,
      color: theme.palette.success.main,
      route: "/reports",
      gradient: `linear-gradient(135deg, ${theme.palette.success.main}, ${theme.palette.success.dark})`,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Top Navigation */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
        }}
      >
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            SmartLiva Portal
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <LanguageSwitcher />
            <IconButton color="inherit" onClick={() => router.push("/welcome")}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {/* Header */}
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: theme.palette.primary.main,
            }}
          >
            {t("portal.title")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: 600,
              mx: "auto",
            }}
          >
            {t("portal.subtitle")}
          </Typography>
        </Box>

        {/* Service Cards */}
        <Grid container spacing={4} justifyContent="center">
          {services.map((service, index) => (
            <Grid item xs={12} sm={6} md={4} key={service.id}>
              <Fade in timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: 400,
                    display: "flex",
                    flexDirection: "column",
                    cursor: "pointer",
                    transition: "all 0.3s ease-in-out",
                    background: "white",
                    border: `2px solid ${alpha(service.color, 0.1)}`,
                    "&:hover": {
                      transform: "translateY(-12px) scale(1.02)",
                      boxShadow: `0 20px 60px ${alpha(service.color, 0.3)}`,
                      border: `2px solid ${alpha(service.color, 0.3)}`,
                    },
                  }}
                  onClick={() => router.push(service.route)}
                >
                  <Box
                    sx={{
                      height: 200,
                      background: service.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Background pattern */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: -20,
                        right: -20,
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        background: alpha("#ffffff", 0.1),
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: -30,
                        left: -30,
                        width: 100,
                        height: 100,
                        borderRadius: "50%",
                        background: alpha("#ffffff", 0.1),
                      }}
                    />

                    {service.icon}
                  </Box>

                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        mb: 2,
                        fontWeight: 700,
                        color: service.color,
                      }}
                    >
                      {service.title}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {service.description}
                    </Typography>
                  </CardContent>

                  <Box sx={{ p: 3, pt: 0 }}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        py: 1.5,
                        background: service.gradient,
                        "&:hover": {
                          background: service.gradient,
                          filter: "brightness(1.1)",
                        },
                      }}
                    >
                      {t("portal.open_service")}
                    </Button>
                  </Box>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>

        {/* Status Bar */}
        <Box
          sx={{
            mt: 8,
            p: 3,
            bgcolor: "white",
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          }}
        >
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  AI Status
                </Typography>
                <Typography variant="body2" color="success.main">
                  {t("portal.status.online")}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  {t("portal.status.accuracy")}
                </Typography>
                <Typography variant="body2" color="success.main">
                  95.3%
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  {t("portal.status.response_time")}
                </Typography>
                <Typography variant="body2" color="success.main">
                  &lt;2s
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={3}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 700 }}
                >
                  {t("portal.status.version")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  v2.1.0
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
}
