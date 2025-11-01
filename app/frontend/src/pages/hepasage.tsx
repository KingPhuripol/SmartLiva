import { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Fab,
} from "@mui/material";
import {
  Chat,
  ArrowBack,
  Send,
  Psychology,
  Person,
  Help as HelpIcon,
} from "@mui/icons-material";
import { useLanguage } from "../contexts/LanguageContextSimple";
import LanguageSwitcher from "../components/LanguageSwitcher";
import HelpDialog from "../components/HelpDialog";
import { useRouter } from "next/router";
import { chat, ChatMessage } from "../lib/api";

export default function HepaSagePage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "",
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { t, currentLanguage } = useLanguage();
  const router = useRouter();

  useEffect(() => {
    // Set initial greeting based on language
    const greeting =
      currentLanguage === "th"
        ? "สวัสดีครับ! ผม Dr. HepaSage แพทย์เฉพาะทางด้านตับวิทยา พร้อมให้คำปรึกษาเกี่ยวกับสุขภาพตับ เส้นใยแข็งตับ ตับอักเสบ ตับแข็ง และการดูแลสุขภาพตับ มีอะไรให้ช่วยเหลือครับ?"
        : currentLanguage === "de"
        ? "Hallo! Ich bin Dr. HepaSage, ein Spezialist für Hepatologie. Ich bin hier, um Ihnen bei Lebergesundheit, Fibrose, Hepatitis, Zirrhose und Leberpflege zu helfen. Wie kann ich Ihnen heute helfen?"
        : "Hello! I'm Dr. HepaSage, a specialist in hepatology. I'm here to help you with liver health, fibrosis, hepatitis, cirrhosis, and liver care. How may I assist you today?";

    setMessages([
      {
        role: "assistant",
        content: greeting,
        timestamp: new Date(),
      },
    ]);
  }, [currentLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setLoading(true);

    try {
      const response = await chat({
        history: [...messages, userMessage],
        max_new_tokens: 512,
        temperature: 0.7,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.reply,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          currentLanguage === "th"
            ? "ขออภัยครับ เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง"
            : "Sorry, there was an error connecting. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions =
    currentLanguage === "th"
      ? [
          "ระยะของเส้นใยแข็งตับมีกี่ระยะ?",
          "ตับอักเสบมีสาเหตุจากอะไรบ้าง?",
          "การดูแลตับในชีวิตประจำวัน",
          "อาหารที่ดีต่อสุขภาพตับ",
        ]
      : [
          "What are the stages of liver fibrosis?",
          "What causes hepatitis?",
          "Daily liver care tips",
          "Foods good for liver health",
        ];

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fa" }}>
      {/* Top Navigation */}
      <AppBar
        position="static"
        elevation={0}
        sx={{ bgcolor: "secondary.main" }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={() => router.push("/portal")}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>

          <Chat sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            HepaSage™ {t("hepasage.medical_assistant")}
          </Typography>

          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Container
        maxWidth="lg"
        sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          py: 2,
        }}
      >
        <Grid container spacing={2} sx={{ flexGrow: 1 }}>
          {/* Chat Area */}
          <Grid item xs={12} md={8}>
            <Paper
              elevation={2}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                bgcolor: "white",
              }}
            >
              {/* Chat Header */}
              <Box sx={{ p: 3, borderBottom: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>
                    <Psychology />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Dr. HepaSage
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t("hepasage.specialist_title")}
                    </Typography>
                  </Box>
                  <Chip
                    label={t("hepasage.online")}
                    color="success"
                    size="small"
                    sx={{ ml: "auto" }}
                  />
                </Box>
              </Box>

              {/* Messages Area */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflow: "auto",
                  p: 2,
                  bgcolor: "#fafafa",
                }}
              >
                {messages.map((message, index) => (
                  <Box
                    key={index}
                    sx={{
                      mb: 2,
                      display: "flex",
                      justifyContent:
                        message.role === "user" ? "flex-end" : "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1, maxWidth: "80%" }}>
                      {message.role === "assistant" && (
                        <Avatar
                          sx={{
                            bgcolor: "secondary.main",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Psychology sx={{ fontSize: 20 }} />
                        </Avatar>
                      )}

                      <Paper
                        elevation={1}
                        sx={{
                          p: 2,
                          bgcolor:
                            message.role === "user" ? "primary.main" : "white",
                          color:
                            message.role === "user" ? "white" : "text.primary",
                          borderRadius: 2,
                          borderTopLeftRadius:
                            message.role === "assistant" ? 0 : 2,
                          borderTopRightRadius: message.role === "user" ? 0 : 2,
                        }}
                      >
                        <Typography variant="body1" sx={{ lineHeight: 1.5 }}>
                          {message.content}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            opacity: 0.7,
                            display: "block",
                            mt: 1,
                          }}
                        >
                          {message.timestamp?.toLocaleTimeString()}
                        </Typography>
                      </Paper>

                      {message.role === "user" && (
                        <Avatar
                          sx={{
                            bgcolor: "primary.main",
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Person sx={{ fontSize: 20 }} />
                        </Avatar>
                      )}
                    </Box>
                  </Box>
                ))}

                {loading && (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-start",
                      mb: 2,
                    }}
                  >
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Avatar
                        sx={{
                          bgcolor: "secondary.main",
                          width: 32,
                          height: 32,
                        }}
                      >
                        <Psychology sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Paper elevation={1} sx={{ p: 2, bgcolor: "white" }}>
                        <CircularProgress size={20} />
                        <Typography
                          variant="body2"
                          sx={{ ml: 2, display: "inline" }}
                        >
                          {t("hepasage.typing")}
                        </Typography>
                      </Paper>
                    </Box>
                  </Box>
                )}

                <div ref={messagesEndRef} />
              </Box>

              {/* Input Area */}
              <Box sx={{ p: 2, borderTop: "1px solid #e0e0e0" }}>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={t("hepasage.input_placeholder")}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    disabled={loading}
                    multiline
                    maxRows={3}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || loading}
                    sx={{ px: 3 }}
                  >
                    <Send />
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                {t("hepasage.quick_questions")}
              </Typography>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outlined"
                    onClick={() => setInputMessage(question)}
                    sx={{
                      justifyContent: "flex-start",
                      textAlign: "left",
                      textTransform: "none",
                      py: 1.5,
                    }}
                  >
                    {question}
                  </Button>
                ))}
              </Box>

              <Box sx={{ mt: 4, p: 2, bgcolor: "info.50", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  ℹ️ {t("hepasage.disclaimer_title")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.85rem" }}
                >
                  {t("hepasage.disclaimer")}
                </Typography>
              </Box>

              <Box sx={{ mt: 3, p: 2, bgcolor: "success.50", borderRadius: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  🏥 {t("hepasage.capabilities")}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: "0.85rem" }}
                >
                  • {t("hepasage.capability1")}
                  <br />• {t("hepasage.capability2")}
                  <br />• {t("hepasage.capability3")}
                  <br />• {t("hepasage.capability4")}
                </Typography>
              </Box>
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
        type="hepasage"
      />
    </Box>
  );
}
