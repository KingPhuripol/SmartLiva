import { useEffect, useRef, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Chip,
  Grid,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ClearIcon from "@mui/icons-material/Clear";
import { t, Lang } from "../i18n";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<ChatMessage[]>([]);
  const [lastError, setLastError] = useState<string | null>(null);
  const [apiBase, setApiBase] = useState<string>("");
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const healthTimer = useRef<any>(null);

  // Robust API base resolver (handles non-localhost access & container builds)
  useEffect(() => {
    function resolveBase(): string {
      const env = process.env.NEXT_PUBLIC_API_BASE;
      if (env && env.trim() && env !== "undefined") {
        return env.replace(/\/$/, "");
      }
      if (typeof window !== "undefined") {
        const host = window.location.hostname;
        // If already on port 8000 or backend proxied, try same origin
        if (window.location.port === "8000") return window.location.origin;
        return `${window.location.protocol}//${host}:8000`;
      }
      return "http://localhost:8000";
    }
    const resolved = resolveBase();
    console.log("Resolved API base:", resolved); // Debug log
    setApiBase(resolved);
  }, []);

  // Periodic backend health check (lightweight) to aid debugging
  useEffect(() => {
    if (!apiBase) return;
    async function check() {
      try {
        const ctrl = new AbortController();
        const t = setTimeout(() => ctrl.abort(), 4000);
        const r = await fetch(apiBase + "/health", { signal: ctrl.signal });
        clearTimeout(t);
        setBackendOk(r.ok);
      } catch {
        setBackendOk(false);
      }
    }
    check();
    healthTimer.current && clearInterval(healthTimer.current);
    healthTimer.current = setInterval(check, 20000);
    return () => healthTimer.current && clearInterval(healthTimer.current);
  }, [apiBase]);

  const exampleQuestions = [
    t(lang, "example1"),
    t(lang, "example2"),
    t(lang, "example3"),
    t(lang, "example4"),
  ];

  const clearChat = () => {
    setHistory([]);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newHistory: ChatMessage[] = [
      ...history,
      { role: "user" as const, content: input },
    ];
    setHistory(newHistory);
    setInput("");
    setLoading(true);
    setLastError(null);
    try {
      if (!apiBase)
        throw new Error("API base URL not configured (apiBase empty)");
      if (backendOk === false)
        throw new Error("Backend unreachable (health check failed)");
      const endpoint = apiBase + "/chat";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newHistory,
          max_new_tokens: 300,
          temperature: 0.7,
        }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          detail = (await res.text()).slice(0, 300);
        } catch {}
        throw new Error(`Chat failed (status ${res.status}) ${detail}`);
      }
      const data = await res.json();
      setHistory([
        ...newHistory,
        { role: "assistant" as const, content: data.reply },
      ]);
    } catch (e: any) {
      setLastError(e.message || "Unknown error");
      setHistory([
        ...newHistory,
        { role: "assistant" as const, content: e.message },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" fontWeight={700}>
          {t(lang, "chat")}
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          {history.length > 0 && (
            <IconButton
              onClick={clearChat}
              color="error"
              size="small"
              title={t(lang, "clearChat")}
            >
              <ClearIcon />
            </IconButton>
          )}
          <ToggleButtonGroup
            size="small"
            value={lang}
            exclusive
            onChange={(_, v) => v && setLang(v)}
          >
            <ToggleButton value="en">EN</ToggleButton>
            <ToggleButton value="th">TH</ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
      <Paper
        sx={{ p: 3, mb: 2, height: "60vh", overflowY: "auto", borderRadius: 4 }}
      >
        {/* Connectivity badge */}
        <Box mb={1} display="flex" gap={1} flexWrap="wrap">
          {apiBase && (
            <Chip
              size="small"
              label={`API: ${apiBase}`}
              color={
                backendOk
                  ? "success"
                  : backendOk === false
                  ? "error"
                  : "default"
              }
            />
          )}
        </Box>
        {lastError && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: "block", mb: 1 }}
          >
            {lastError}
          </Typography>
        )}
        {history.length === 0 && (
          <>
            <Typography
              variant="body1"
              color="primary"
              sx={{ mb: 3, fontWeight: 600 }}
            >
              {t(lang, "chatWelcome")}
            </Typography>
            <Typography variant="h6" color="text.primary" sx={{ mb: 2 }}>
              {t(lang, "exampleQuestions")}
            </Typography>
            <Grid container spacing={2}>
              {exampleQuestions.map((question, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Chip
                    label={question}
                    variant="outlined"
                    onClick={() => setInput(question)}
                    sx={{
                      width: "100%",
                      justifyContent: "flex-start",
                      height: "auto",
                      py: 1,
                      px: 2,
                      "& .MuiChip-label": {
                        whiteSpace: "normal",
                        textAlign: "left",
                      },
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
        {history.map((m, i) => (
          <Box key={i} mb={3}>
            <Box display="flex" alignItems="center" gap={1} mb={1}>
              <Typography
                variant="caption"
                color={m.role === "user" ? "primary.main" : "secondary.main"}
                fontWeight={600}
              >
                {m.role === "user"
                  ? lang === "th"
                    ? "คุณ"
                    : "You"
                  : "🩺 HepaSage™"}
              </Typography>
              <Typography variant="caption" color="text.disabled">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
            </Box>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor: m.role === "user" ? "primary.50" : "grey.50",
                borderRadius: 2,
                border: m.role === "user" ? "1px solid" : "none",
                borderColor: m.role === "user" ? "primary.200" : "transparent",
              }}
            >
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", lineHeight: 1.6 }}
              >
                {m.content}
              </Typography>
            </Paper>
          </Box>
        ))}
        {loading && (
          <Typography variant="caption" color="primary.main">
            {t(lang, "typing")}
          </Typography>
        )}
      </Paper>
      <Box display="flex" gap={1}>
        <TextField
          fullWidth
          size="small"
          placeholder={t(lang, "chatPlaceholder")}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <IconButton color="primary" onClick={sendMessage} disabled={loading}>
          <SendIcon />
        </IconButton>
      </Box>
    </Container>
  );
}
