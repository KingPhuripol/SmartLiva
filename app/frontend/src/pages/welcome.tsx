import { useState, useEffect } from "react";
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
  LinearProgress,
} from "@mui/material";
import {
  Science,
  Chat,
  Assessment,
  Login,
  ArrowForward,
} from "@mui/icons-material";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useRouter } from "next/router";

export default function WelcomePage() {
  const { t } = useLanguage();
  const theme = useTheme();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate system initialization
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          color: "white",
        }}
      >
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 2 }}>
            SmartLiva
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9, mb: 4 }}>
            {t("welcome.initializing")}
          </Typography>
          <Box sx={{ width: 300, mx: "auto" }}>
            <LinearProgress
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: alpha("#ffffff", 0.3),
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "white",
                },
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)",
      }}
    >
      {/* Language Switcher */}
      <Box sx={{ position: "absolute", top: 20, right: 20, zIndex: 1000 }}>
        <LanguageSwitcher />
      </Box>

      <Container maxWidth="lg">
        {/* Header Section */}
        <Box sx={{ pt: 8, pb: 6, textAlign: "center" }}>
          <Fade in timeout={1000}>
            <Box>
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 700,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  mb: 3,
                  fontSize: { xs: "2.5rem", md: "4rem" },
                }}
              >
                SmartLiva
              </Typography>

              <Typography
                variant="h4"
                sx={{
                  color: "text.primary",
                  mb: 3,
                  fontWeight: 600,
                }}
              >
                {t("welcome.title")}
              </Typography>

              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  mb: 6,
                  maxWidth: 800,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                {t("welcome.subtitle")}
              </Typography>
            </Box>
          </Fade>
        </Box>

        {/* System Overview Cards */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          <Grid item xs={12} md={4}>
            <Fade in timeout={1200}>
              <Card
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 40px ${alpha(
                      theme.palette.primary.main,
                      0.2
                    )}`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  <Science
                    sx={{
                      fontSize: 60,
                      color: theme.palette.primary.main,
                      mb: 2,
                    }}
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {t("welcome.feature1.title")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t("welcome.feature1.desc")}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={1400}>
              <Card
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.secondary.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                  border: `2px solid ${alpha(
                    theme.palette.secondary.main,
                    0.1
                  )}`,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 40px ${alpha(
                      theme.palette.secondary.main,
                      0.2
                    )}`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  <Chat
                    sx={{
                      fontSize: 60,
                      color: theme.palette.secondary.main,
                      mb: 2,
                    }}
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {t("welcome.feature2.title")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t("welcome.feature2.desc")}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>

          <Grid item xs={12} md={4}>
            <Fade in timeout={1600}>
              <Card
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.success.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.success.main, 0.1)} 100%)`,
                  border: `2px solid ${alpha(theme.palette.success.main, 0.1)}`,
                  transition: "all 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: `0 12px 40px ${alpha(
                      theme.palette.success.main,
                      0.2
                    )}`,
                  },
                }}
              >
                <CardContent sx={{ textAlign: "center", p: 4 }}>
                  <Assessment
                    sx={{
                      fontSize: 60,
                      color: theme.palette.success.main,
                      mb: 2,
                    }}
                  />
                  <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
                    {t("welcome.feature3.title")}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {t("welcome.feature3.desc")}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Call to Action */}
        <Box sx={{ textAlign: "center", pb: 8 }}>
          <Fade in timeout={1800}>
            <Box>
              <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                {t("welcome.ready")}
              </Typography>

              <Button
                variant="contained"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => router.push("/portal")}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: "1.2rem",
                  background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                    transform: "translateY(-2px)",
                    boxShadow: `0 8px 25px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  },
                }}
              >
                {t("welcome.enter_system")}
              </Button>
            </Box>
          </Fade>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          py: 4,
          textAlign: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.02),
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            {t("welcome.footer")}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
