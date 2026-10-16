import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Ban, Check, Download, RefreshCw, Trash2 } from "lucide-react";
import { api, downloadRegistrationPdf, downloadRegistrationsCsv } from "../../services/api";
import type { DashboardSummary, RegistrationRow } from "../../types";
import { useLanguage } from "../../utils/i18n";

interface AdminDashboardProps {
  token: string;
  onLogout: () => void;
}

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
  const { t } = useLanguage();
  const [rows, setRows] = useState<RegistrationRow[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<RegistrationRow | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [counts, registrations] = await Promise.all([
        api.summary(token),
        api.registrations(token, search),
      ]);
      setSummary(counts);
      setRows(registrations);
      setError("");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load dashboard.");
    }
  }, [token, search]);

  useEffect(() => { void refresh(); }, [refresh]);

  async function setStatus(row: RegistrationRow, status: "Approved" | "Rejected") {
    try {
      await api.updateRegistration(token, row.registration_no, { status });
      await refresh();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update application.");
    }
  }

  async function deleteRegistration() {
    if (!deleteTarget) return;
    try {
      await api.deleteRegistration(token, deleteTarget.registration_no);
      setDeleteTarget(null);
      await refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete application.");
    }
  }

  async function exportCsv() {
    try { await downloadRegistrationsCsv(token); }
    catch (exportError) { setError(exportError instanceof Error ? exportError.message : "Unable to export registrations."); }
  }

  async function downloadPdf(row: RegistrationRow) {
    try { await downloadRegistrationPdf(row.download_token, row.registration_no); }
    catch (downloadError) { setError(downloadError instanceof Error ? downloadError.message : "Unable to download PDF."); }
  }

  const metrics: Array<[string, number]> = summary ? [
    ["Total applications", summary.total], ["Pending", summary.pending],
    ["Approved", summary.approved], ["Rejected", summary.rejected],
    ["Active memberships", summary.active],
  ] : [];

  return <Paper component="section" elevation={1} className="admin-dashboard">
    <Stack className="admin-toolbar" direction="row" justifyContent="space-between" alignItems="center">
      <Box><Typography className="eyebrow" variant="overline">{t("LIBRARY OPERATIONS")}</Typography><Typography component="h2" variant="h5">{t("Applications")}</Typography></Box>
      <Button className="admin-primary-action" variant="contained" onClick={onLogout}>{t("Log out")}</Button>
    </Stack>

    <Box className="summary-grid">
      {metrics.map(([label, value]) => <Paper variant="outlined" className="summary-tile" key={label}><Typography variant="caption">{t(label)}</Typography><Typography component="strong" variant="h5">{value}</Typography></Paper>)}
    </Box>

    <Box className="admin-search-toolbar">
      <TextField className="admin-search-field" size="small" label={t("Search applications")} placeholder={t("Name, mobile, or registration")} value={search} onChange={(event) => setSearch(event.target.value)} />
      <Stack direction="row" spacing={1} className="admin-search-actions">
        <Button className="admin-primary-action" variant="contained" onClick={() => void exportCsv()}>{t("Export CSV")}</Button>
        <IconButton aria-label={t("Refresh applications")} title={t("Refresh applications")} size="small" onClick={() => void refresh()}><RefreshCw size={17} /></IconButton>
      </Stack>
    </Box>
    {error && <Alert severity="error" role="alert" sx={{ mt: 2 }}>{t(error)}</Alert>}

    <TableContainer component={Paper} variant="outlined" className="table-wrap">
      <Table size="small" aria-label={t("Student registration applications")}>
        <TableHead><TableRow><TableCell>{t("Registration")}</TableCell><TableCell>{t("Name")}</TableCell><TableCell>{t("Mobile")}</TableCell><TableCell>{t("Exam")}</TableCell><TableCell>{t("Status")}</TableCell><TableCell>{t("Payment mode")}</TableCell><TableCell>{t("Amount")}</TableCell><TableCell>{t("Payment status")}</TableCell><TableCell>{t("Actions")}</TableCell></TableRow></TableHead>
        <TableBody>{rows.map((row) => <TableRow key={row.registration_no} hover>
          <TableCell>{row.registration_no}</TableCell><TableCell>{row.full_name}</TableCell><TableCell>{row.mobile}</TableCell><TableCell>{t(row.exam_category)}</TableCell>
          <TableCell><Chip size="small" label={t(row.status)} color={row.status === "Approved" ? "success" : row.status === "Rejected" ? "error" : "warning"} /></TableCell>
          <TableCell>{t(row.payment_mode)}</TableCell><TableCell>₹{row.amount_due}</TableCell><TableCell>{t(row.payment_status)}</TableCell>
          <TableCell><Stack direction="row" spacing={0.5} alignItems="center" className="row-actions">
            <Tooltip title={t("PDF")}>
              <IconButton className="row-pdf-action" size="small" aria-label={`${t("PDF")} ${row.registration_no}`} onClick={() => void downloadPdf(row)}>
                <Download size={16} />
              </IconButton>
            </Tooltip>
            {row.status !== "Approved" && <Tooltip title={t("Approve")}>
              <IconButton className="row-approve-action" size="small" aria-label={`${t("Approve")} ${row.registration_no}`} onClick={() => void setStatus(row, "Approved")}>
                <Check size={16} />
              </IconButton>
            </Tooltip>}
            {row.status !== "Rejected" && <Tooltip title={t("Reject")}>
              <IconButton className="row-reject-action" size="small" color="error" aria-label={`${t("Reject")} ${row.registration_no}`} onClick={() => void setStatus(row, "Rejected")}>
                <Ban size={16} />
              </IconButton>
            </Tooltip>}
            <Tooltip title={t("Delete")}>
              <IconButton className="row-delete-action" size="small" color="error" aria-label={`${t("Delete")} ${row.registration_no}`} onClick={() => setDeleteTarget(row)}>
                <Trash2 size={16} />
              </IconButton>
            </Tooltip>
          </Stack></TableCell>
        </TableRow>)}</TableBody>
      </Table>
      {rows.length === 0 && <Typography className="empty-state" color="text.secondary">{t("No applications found.")}</Typography>}
    </TableContainer>
    <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} aria-labelledby="delete-registration-title">
      <DialogTitle id="delete-registration-title">{t("Delete application?")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("This will permanently delete application")} <strong>{deleteTarget?.registration_no}</strong>. {t("Its generated PDF will also be deleted. This action cannot be undone.")}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteTarget(null)}>{t("Cancel")}</Button>
        <Button color="error" variant="contained" onClick={() => void deleteRegistration()}>{t("Delete")}</Button>
      </DialogActions>
    </Dialog>
  </Paper>;
}
