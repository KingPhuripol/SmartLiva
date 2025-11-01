import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "../theme";
import CssBaseline from "@mui/material/CssBaseline";
import { LanguageProvider } from "../contexts/LanguageContextSimple";

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>SmartLiva • FibroGauge™ & HepaSage™</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <LanguageProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Component {...pageProps} />
        </ThemeProvider>
      </LanguageProvider>
    </>
  );
}
