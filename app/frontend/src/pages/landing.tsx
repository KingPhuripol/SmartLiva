import { useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Card,
  CardContent,
  Fade,
  IconButton,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Science,
  Chat,
  Speed,
  Security,
  Assessment,
  Language,
  PlayArrow,
  ArrowForward,
} from "@mui/icons-material";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { useRouter } from "next/router";

// Feature card component
const FeatureCard = ({ icon, title, description, delay }: any) => {
  const theme = useTheme();

  return (
    <Fade in timeout={1000} style={{ transitionDelay: `${delay}ms` }}>
      <Card
        sx={{
          height: "100%",
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.05
          )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          transition: "all 0.3s ease-in-out",
          "&:hover": {
            transform: "translateY(-8px)",
            boxShadow: `0 12px 40px ${alpha(theme.palette.primary.main, 0.2)}`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
          },
        }}
      >
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: "50%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: "white",
              width: 80,
              height: 80,
              mx: "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Fade>
  );
};

export default function LandingPage() {
  const { t } = useLanguage();
  const theme = useTheme();
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);

  const features = [
    {
      icon: <Science sx={{ fontSize: 40 }} />,
      title: t("landing.feature1.title"),
      description: t("landing.feature1.desc"),
      delay: 200,
    },
    {
      icon: <Chat sx={{ fontSize: 40 }} />,
      title: t("landing.feature2.title"),
      description: t("landing.feature2.desc"),
      delay: 400,
    },
    {
      icon: <Speed sx={{ fontSize: 40 }} />,
      title: t("landing.feature3.title"),
      description: t("landing.feature3.desc"),
      delay: 600,
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: t("landing.feature4.title"),
      description: t("landing.feature4.desc"),
      delay: 800,
    },
    {
      icon: <Assessment sx={{ fontSize: 40 }} />,
      title: t("landing.feature5.title"),
      description: t("landing.feature5.desc"),
      delay: 1000,
    },
    {
      icon: <Language sx={{ fontSize: 40 }} />,
      title: t("landing.feature6.title"),
      description: t("landing.feature6.desc"),
      delay: 1200,
    },
  ];

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

      {/* Hero Section */}
      <Container maxWidth="lg">
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
                  fontSize: { xs: "2.5rem", md: "3.5rem" },
                }}
              >
                {t("landing.hero.title")}
              </Typography>

              <Typography
                variant="h5"
                sx={{
                  color: "text.secondary",
                  mb: 4,
                  maxWidth: 800,
                  mx: "auto",
                  lineHeight: 1.6,
                }}
              >
                {t("landing.hero.subtitle")}
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: "text.secondary",
                  mb: 6,
                  maxWidth: 600,
                  mx: "auto",
                  fontSize: "1.1rem",
                  lineHeight: 1.7,
                }}
              >
                {t("landing.hero.description")}
              </Typography>
            </Box>
          </Fade>

          <Fade in timeout={1500}>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                variant="contained"
                size="large"
                startIcon={<PlayArrow />}
                onClick={() => router.push("/dashboard")}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
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
                {t("landing.cta.start")}
              </Button>

              <Button
                variant="outlined"
                size="large"
                endIcon={<ArrowForward />}
                onClick={() => setShowDemo(true)}
                sx={{
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {t("landing.cta.demo")}
              </Button>
            </Box>
          </Fade>
        </Box>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ textAlign: "center", mb: 6 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 700,
              mb: 3,
              color: theme.palette.primary.main,
            }}
          >
            {t("landing.features.title")}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: "text.secondary",
              maxWidth: 600,
              mx: "auto",
            }}
          >
            {t("landing.features.subtitle")}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <FeatureCard {...feature} />
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Technology Section */}
      <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.03), py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: "center", mb: 6 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
                color: theme.palette.primary.main,
              }}
            >
              {t("landing.tech.title")}
            </Typography>
          </Box>

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.primary.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  {t("landing.tech.ai.title")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  {t("landing.tech.ai.desc1")}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {t("landing.tech.ai.desc2")}
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 4,
                  background: `linear-gradient(135deg, ${alpha(
                    theme.palette.secondary.main,
                    0.05
                  )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(
                    theme.palette.secondary.main,
                    0.1
                  )}`,
                }}
              >
                <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
                  {t("landing.tech.medical.title")}
                </Typography>
                <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.7 }}>
                  {t("landing.tech.medical.desc1")}
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                  {t("landing.tech.medical.desc2")}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Call to Action Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
            {t("landing.cta.title")}
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            {t("landing.cta.subtitle")}
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={() => router.push("/dashboard")}
            sx={{
              px: 6,
              py: 2,
              fontSize: "1.2rem",
              bgcolor: "white",
              color: theme.palette.primary.main,
              "&:hover": {
                bgcolor: alpha("#ffffff", 0.9),
                transform: "translateY(-2px)",
                boxShadow: "0 8px 25px rgba(0,0,0,0.2)",
              },
            }}
          >
            {t("landing.cta.get_started")}
          </Button>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: "#f8f9fa", py: 4, textAlign: "center" }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            {t("landing.footer")}
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
