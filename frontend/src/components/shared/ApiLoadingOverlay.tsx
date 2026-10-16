import { Backdrop, CircularProgress, Typography } from "@mui/material";
import { useLanguage } from "../../utils/i18n";

export function ApiLoadingOverlay({ open }: { open: boolean }) {
  const { t } = useLanguage();
  return <Backdrop className="api-loading-overlay" open={open} aria-label={t("Loading library information")} role="status">
    <CircularProgress color="inherit" size={34} />
    <Typography variant="body2">{t("Please wait…")}</Typography>
  </Backdrop>;
}
