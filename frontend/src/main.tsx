import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { enUS, hiIN } from "@mui/material/locale";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import "dayjs/locale/hi";
import App from "./App";
import { LanguageProvider, type Language } from "./utils/i18n";
import "./style.css";
import "./overrides.css";
import "./mui.css";

function Root() {
  const [mode, setMode] = useState<"light" | "dark">(() =>
    localStorage.getItem("sankalp-color-mode") === "dark" ? "dark" : "light",
  );
  const [language, setLanguage] = useState<Language>(() => localStorage.getItem("sankalp-language") === "hi" ? "hi" : "en");
  const theme = useMemo(() => createTheme({
    palette: {
      mode,
      primary: mode === "light"
        ? { main: "#12294b", dark: "#0b1c35", contrastText: "#ffffff" }
        : { main: "#f5c52e", dark: "#dca900", contrastText: "#17263b" },
      secondary: { main: "#f5c52e", contrastText: "#17263b" },
      background: mode === "light"
        ? { default: "#f3f6fa", paper: "#ffffff" }
        : { default: "#101923", paper: "#172432" },
      text: mode === "light"
        ? { primary: "#18253a", secondary: "#63718a" }
        : { primary: "#edf3f9", secondary: "#b7c4d2" },
      divider: mode === "light" ? "#dfe6ef" : "#384b5c",
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: 'Inter, "Noto Sans Devanagari", "Nirmala UI", Mangal, system-ui, sans-serif',
      fontSize: 14,
      button: { fontWeight: 700, textTransform: "none" },
      body1: { fontSize: "0.9375rem" },
      body2: { fontSize: "0.8125rem" },
    },
    components: {
      MuiButton: { styleOverrides: { root: { minHeight: 40 } } },
      MuiTextField: { defaultProps: { size: "small" } },
      MuiFormControl: { defaultProps: { size: "small" } },
    },
  }, language === "hi" ? hiIN : enUS), [mode, language]);

  useEffect(() => {
    localStorage.setItem("sankalp-color-mode", mode);
    document.documentElement.dataset.theme = mode;
  }, [mode]);
  useEffect(() => {
    localStorage.setItem("sankalp-language", language);
    document.documentElement.lang = language;
  }, [language]);

  return <LanguageProvider language={language} setLanguage={setLanguage}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider
        dateAdapter={AdapterDayjs}
        adapterLocale={language === "hi" ? "hi" : "en"}
        localeText={language === "hi" ? { cancelButtonLabel: "रद्द करें", okButtonLabel: "ठीक है", todayButtonLabel: "आज" } : undefined}
      >
        <App mode={mode} onToggleMode={() => setMode((current) => current === "light" ? "dark" : "light")} />
      </LocalizationProvider>
    </ThemeProvider>
  </LanguageProvider>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><Root /></React.StrictMode>);
