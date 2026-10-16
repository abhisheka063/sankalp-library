import { useState, type FormEvent } from "react";
import { Alert, Button, Paper, Stack, TextField, Typography } from "@mui/material";
import { api } from "../../services/api";
import { useLanguage } from "../../utils/i18n";

export function AdminLoginForm({ onLogin }: { onLogin: (token: string) => void }) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError("");
    const fields = new FormData(event.currentTarget);
    try { const result = await api.login(String(fields.get("username")), String(fields.get("password"))); onLogin(result.access_token); }
    catch (loginError) { setError(loginError instanceof Error ? loginError.message : "Login failed."); }
  }
  return <Paper component="form" elevation={1} className="admin-login-card" onSubmit={submit}>
    <Stack spacing={1.5}>
      <Typography component="h2" variant="h5">{t("Administrator login")}</Typography>
      <TextField size="small" name="username" label={t("Username")} required autoComplete="username" />
      <TextField size="small" name="password" label={t("Password")} type="password" required autoComplete="current-password" />
      {error && <Alert severity="error" role="alert">{t(error)}</Alert>}
      <Button type="submit" variant="contained">{t("Log in")}</Button>
    </Stack>
  </Paper>;
}
