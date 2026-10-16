import { useEffect, useState, useSyncExternalStore, type MouseEvent } from "react";
import { Alert, Box, Button, Container, Paper, Typography } from "@mui/material";
import { House } from "lucide-react";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { AdminLoginForm } from "./components/admin/AdminLoginForm";
import { ApiLoadingOverlay } from "./components/shared/ApiLoadingOverlay";
import { LibraryFooter } from "./components/shared/LibraryFooter";
import { LibraryHeader } from "./components/shared/LibraryHeader";
import { Facilities } from "./components/registration/Facilities";
import { PromotionalPoster } from "./components/registration/PromotionalPoster";
import { RegistrationConfirmation } from "./components/registration/RegistrationConfirmation";
import { RegistrationForm } from "./components/registration/RegistrationForm";
import { api, apiLoading } from "./services/api";
import type { PublicConfig, RegistrationResult } from "./types";
import { useLanguage } from "./utils/i18n";

export default function App({ mode, onToggleMode }: { mode: "light" | "dark"; onToggleMode: () => void }) {
  const [config, setConfig] = useState<PublicConfig | null>(null);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [token, setToken] = useState(() => localStorage.getItem("adminToken") || "");
  const [loadError, setLoadError] = useState("");
  const { t } = useLanguage();
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const isApiLoading = useSyncExternalStore(apiLoading.subscribe, apiLoading.getSnapshot, () => false);
  const isAdmin = pathname.startsWith("/admin");
  useEffect(() => {
    const syncPathname = () => setPathname(window.location.pathname);
    window.addEventListener("popstate", syncPathname);
    return () => window.removeEventListener("popstate", syncPathname);
  }, []);
  function handleInternalNavigation(event: MouseEvent<HTMLElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (!(event.target instanceof Element)) return;
    const link = event.target.closest("a");
    if (!link || link.target || link.hasAttribute("download")) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin || destination.hash) return;
    event.preventDefault();
    if (destination.pathname !== window.location.pathname) {
      window.history.pushState({}, "", `${destination.pathname}${destination.search}`);
      setPathname(destination.pathname);
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  }
  useEffect(() => { api.publicConfig().then(setConfig).catch(() => setLoadError("Library information is temporarily unavailable. Please refresh this page.")); }, []);
  function login(value: string) { localStorage.setItem("adminToken", value); setToken(value); }
  function logout() { localStorage.removeItem("adminToken"); setToken(""); }

  return <Box component="main" className="wrap" id="page-top" onClick={handleInternalNavigation}>
    <ApiLoadingOverlay open={isApiLoading} />
    <LibraryHeader config={config} mode={mode} onToggleMode={onToggleMode} />
    <Container maxWidth="md" disableGutters>
      {isAdmin ? <>
        <Box className="page-title"><Button href="/" color="primary" startIcon={<House size={16} />}>{t("Public site")}</Button>{token && <Typography component="h1" variant="h4">{t("Admin dashboard")}</Typography>}</Box>
        {token ? <AdminDashboard token={token} onLogout={logout} /> : <AdminLoginForm onLogin={login} />}
      </> : result ? <RegistrationConfirmation result={result} /> : <>
        {loadError && <Alert severity="error" role="alert">{t(loadError)}</Alert>}
        <PromotionalPoster />
        <Paper component="section" elevation={0} className="hero">
          <Typography className="eyebrow" variant="overline">{t("YOUR STUDY SPACE IN SIWAN")}</Typography>
          <Typography component="h1" variant="h2">{t("निरंतर अध्ययन")}<br />{t("निरंतर प्रगति")}</Typography>
          <Typography variant="h6">{t("शांत वातावरण · बेहतर सुविधा · उज्ज्वल भविष्य")}</Typography>
          <Button className="hero-cta" variant="contained" href="#register">{t("Register for membership")}</Button>
        </Paper>
        <Facilities config={config} />
        <RegistrationForm config={config} onComplete={setResult} />
      </>}
    </Container>
    <LibraryFooter config={config} />
  </Box>;
}
