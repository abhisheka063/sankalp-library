import { Box, Grid, Paper, Typography } from "@mui/material";
import type { PublicConfig } from "../../types";
import { useLanguage } from "../../utils/i18n";

const facilities = [
  { name: "High-speed Wi-Fi", icon: "⌁" },
  { name: "Comfortable study seating", icon: "▤" },
  { name: "CCTV security", icon: "◉" },
  { name: "Proper lighting", icon: "☼" },
  { name: "Clean drinking water", icon: "◌" },
  { name: "AC / non-AC environment", icon: "❄" },
];

export function Facilities({ config }: { config: PublicConfig | null }) {
  const { t } = useLanguage();
  const items = config?.facilities?.length ? config.facilities : facilities.map((item) => item.name);
  return <Paper component="section" elevation={0} className="facilities" aria-labelledby="facilities-title">
    <Typography className="eyebrow" variant="overline">{t("STUDY WITH FOCUS")}</Typography>
    <Typography id="facilities-title" component="h2" variant="h5">{t("A space built for your preparation")}</Typography>
    <Grid container spacing={1.5}>
      {items.map((name) => <Grid item xs={6} sm={4} key={name}>
        <Box className="facility"><span className="facility-icon" aria-hidden="true">{facilities.find((item) => item.name === name)?.icon || "✓"}</span><Typography variant="body2">{t(name)}</Typography></Box>
      </Grid>)}
    </Grid>
  </Paper>;
}
