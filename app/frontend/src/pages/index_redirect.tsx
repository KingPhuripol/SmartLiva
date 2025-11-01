import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome page
    router.replace("/welcome");
  }, [router]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #1976d2, #42a5f5)",
        color: "white",
      }}
    >
      <CircularProgress sx={{ color: "white", mb: 2 }} />
      <Typography variant="h6">Loading SmartLiva...</Typography>
    </Box>
  );
}
