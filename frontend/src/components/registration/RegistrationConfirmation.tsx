import { useState } from "react";
import { Alert, Button, Typography } from "@mui/material";
import type { RegistrationResult } from "../../types";
import { downloadRegistrationPdf } from "../../services/api";
import { useLanguage } from "../../utils/i18n";

export function RegistrationConfirmation({ result }: { result: RegistrationResult }) {
  const { t } = useLanguage();
  const [downloadError, setDownloadError] = useState("");
  async function downloadPdf() {
    try { await downloadRegistrationPdf(result.download_token, result.registration_no); }
    catch (error) { setDownloadError(error instanceof Error ? error.message : "Unable to download the PDF."); }
  }
  return <section className="card success" aria-live="polite">
    <div className="check" aria-hidden="true">✓</div>
    <p className="eyebrow">{t("APPLICATION RECEIVED")}</p>
    <h1>{t("Thank you for choosing Sankalp.")}</h1>
    <p>{t("Your application is")} <strong>{t(result.status)}</strong>. {t("The library team will contact you at the mobile number you provided.")}</p>
    <p className="regno">{result.registration_no}</p>
    <Typography>{t("Amount due:")} <strong>₹{result.amount_due}</strong></Typography>
    {result.payment_mode === "Online"
      ? <Alert severity="info" className="payment-next-step"><strong>{t("Online payment is coming soon.")}</strong> {t("Your application is saved. Please contact the library to complete payment, or use the payment link once it becomes available.")}</Alert>
      : <Alert severity="info" className="payment-next-step">{t("Payment mode:")} <strong>{t("Cash at reception.")}</strong> {t("Pay")} ₹{result.amount_due} {t("at the library reception.")}</Alert>}
    <p>{t("Keep this registration number for enquiries.")}</p>
    {downloadError && <Alert severity="error" role="alert">{t(downloadError)}</Alert>}
    <Button className="pdf-download" variant="contained" onClick={() => void downloadPdf()}>{t("Download your registration PDF")}</Button>
  </section>;
}
