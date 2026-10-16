import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { api } from "../../services/api";
import type { PublicConfig, RegistrationResult } from "../../types";
import { createIdempotencyKey, EXAM_CATEGORIES } from "../../utils/registration";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { type Dayjs } from "dayjs";
import { useLanguage } from "../../utils/i18n";

interface RegistrationFormProps {
  config: PublicConfig | null;
  onComplete: (result: RegistrationResult) => void;
}

export function RegistrationForm({ config, onComplete }: RegistrationFormProps) {
  const { t } = useLanguage();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [studyTiming, setStudyTiming] = useState("Morning");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "Online">("Cash");
  const [dateOfBirth, setDateOfBirth] = useState<Dayjs | null>(null);
  const planSelectValue = config?.plans.some((plan) => String(plan.id) === selectedPlanId)
    ? Number(selectedPlanId)
    : "";

  useEffect(() => {
    if (config?.plans[0]) setSelectedPlanId(String(config.plans[0].id));
    if (config?.timings[0]) setStudyTiming(config.timings[0]);
  }, [config]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);

    const form = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = Object.fromEntries(form.entries());
    payload.accepted_terms = form.get("accepted_terms") === "on";
    payload.plan_id = Number(payload.plan_id);
    payload.idempotency_key = createIdempotencyKey();

    try {
      onComplete(await api.register(payload));
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <Paper component="section" elevation={1} className="registration-card" id="register">
    <Stack className="section-head" direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
      <Box>
        <Typography component="h2" variant="h4">{t("Register for membership")}</Typography>
        <Typography className="form-intro" color="text.secondary">{t("Complete this short form. Fields marked ")}<span className="required-star">*</span>{t(" are required.")}</Typography>
      </Box>
      {config?.plans[0] && <Paper variant="outlined" className="fee-card"><Typography variant="caption">{t("From")}</Typography><Typography variant="h5">₹{config.plans[0].fee_monthly}</Typography><Typography variant="caption">{t("per month")}</Typography></Paper>}
    </Stack>

    <Box component="form" onSubmit={handleSubmit} className="registration-form">
      <Grid container spacing={1.75}>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" required name="full_name" label={t("Full name")} inputProps={{ minLength: 2, maxLength: 120 }} autoComplete="name" placeholder={t("Your full name")} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" required name="mobile" label={t("Mobile number")} inputMode="numeric" inputProps={{ pattern: "[6-9][0-9]{9}", maxLength: 10 }} placeholder={t("10-digit mobile number")} helperText={t("We use this to contact you about your application.")} />
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth size="small" required multiline minRows={2} name="address" label={t("Full address")} inputProps={{ minLength: 4, maxLength: 1000 }} autoComplete="street-address" placeholder={t("Village / area, district, state")} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <DatePicker
            label={t("Date of birth (optional)")}
            value={dateOfBirth}
            onChange={setDateOfBirth}
            format="DD/MM/YYYY"
            maxDate={dayjs()}
            minDate={dayjs().subtract(100, "year")}
            slotProps={{ textField: { fullWidth: true, size: "small", helperText: t("You can leave this blank.") } }}
          />
          <input type="hidden" name="dob" value={dateOfBirth?.format("YYYY-MM-DD") || ""} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="exam-category-label">{t("Exam preparation category")}</InputLabel>
            <Select size="small" labelId="exam-category-label" name="exam_category" label={t("Exam preparation category")} defaultValue="">
              <MenuItem value="" disabled>{t("Select exam category")}</MenuItem>
              {EXAM_CATEGORIES.map((category) => <MenuItem key={category} value={category}>{t(category)}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="study-timing-label">{t("Preferred study timing")}</InputLabel>
            <Select size="small" labelId="study-timing-label" name="study_timing" label={t("Preferred study timing")} value={studyTiming} onChange={(event) => setStudyTiming(event.target.value)}>
              {(config?.timings || ["Morning", "Afternoon", "Evening", "Flexible"]).map((timing) => <MenuItem key={timing} value={timing}>{t(timing)}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel id="membership-plan-label">{t("Membership plan")}</InputLabel>
            <Select size="small" labelId="membership-plan-label" name="plan_id" label={t("Membership plan")} value={planSelectValue} onChange={(event) => setSelectedPlanId(String(event.target.value))}>
              {config?.plans.map((plan) => <MenuItem key={plan.id} value={plan.id}>{t(plan.name)} — ₹{plan.fee_monthly}/{t("per month")}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField fullWidth size="small" name="emergency_contact" label={t("Emergency contact (optional)")} inputMode="numeric" inputProps={{ pattern: "[6-9][0-9]{9}", maxLength: 10 }} helperText={t("Only used if there is an urgent issue while you are at the library.")} />
        </Grid>
        <Grid item xs={12}>
          <FormControl component="fieldset" className="payment-mode-control">
            <FormLabel component="legend">{t("Payment mode")}</FormLabel>
            <RadioGroup row name="payment_mode" value={paymentMode} onChange={(event) => setPaymentMode(event.target.value as "Cash" | "Online")}>
              <FormControlLabel value="Cash" control={<Radio size="small" />} label={t("Cash at reception")} />
              <FormControlLabel value="Online" control={<Radio size="small" />} label={t("Online payment")} />
            </RadioGroup>
            <FormHelperText>{t(paymentMode === "Online" ? "Online payment will be available soon. You can submit your application now and continue from the payment step.": "Pay the selected plan amount at the library reception.")}</FormHelperText>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Paper variant="outlined" className="terms-card">
            <FormControlLabel required control={<Checkbox name="accepted_terms" required />} label={t("I have read and agree to the membership terms.")} />
            <FormHelperText>{config?.terms ? t(config.terms) : ""}</FormHelperText>
          </Paper>
        </Grid>
        <Grid item xs={12}>
          {error && <Alert severity="error" role="alert" sx={{ mb: 2 }}>{t(error)}</Alert>}
          <Button type="submit" variant="contained" size="large" disabled={busy || !config?.plans.length} startIcon={busy ? <CircularProgress size={18} color="inherit" /> : null}>
            {busy ? t("Submitting…") : t("Submit membership application")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  </Paper>;
}
