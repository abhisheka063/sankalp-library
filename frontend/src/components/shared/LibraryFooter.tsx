import { Box, Container, Divider, Grid, IconButton, Link, Stack, SvgIcon, Typography } from "@mui/material";
import type { PublicConfig } from "../../types";
import { useLanguage } from "../../utils/i18n";

function FacebookIcon() { return <SvgIcon><path d="M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.4-.1-2.4 0-4.1 1.5-4.1 4.2v2.3H7.5v3.1h2.7v8h3.2z" /></SvgIcon>; }
function InstagramIcon() { return <SvgIcon><path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5.5-3.5a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4z" /></SvgIcon>; }
function YouTubeIcon() { return <SvgIcon><path d="M21.6 7.2a2.8 2.8 0 0 0-2-2C17.8 4.7 12 4.7 12 4.7s-5.8 0-7.6.5a2.8 2.8 0 0 0-2 2A29 29 0 0 0 2 12a29 29 0 0 0 .4 4.8 2.8 2.8 0 0 0 2 2c1.8.5 7.6.5 7.6.5s5.8 0 7.6-.5a2.8 2.8 0 0 0 2-2A29 29 0 0 0 22 12a29 29 0 0 0-.4-4.8zM10 15.5v-7l6 3.5-6 3.5z" /></SvgIcon>; }

export function LibraryFooter({ config }: { config: PublicConfig | null }) {
  const { t } = useLanguage();
  const year = new Date().getFullYear();
  const phone = config?.phone || "9939697490";
  return <Box component="footer" id="footer-social" className="site-footer">
    <Container maxWidth="lg" disableGutters>
      <Grid container spacing={4} className="footer-main">
        <Grid item xs={12} md={5}>
          <Typography variant="h6" className="footer-heading">{t("A steady space for focused preparation.")}</Typography>
          <Typography variant="body2" className="footer-muted">{t("Quiet study. Clear goals. Consistent progress.")}</Typography>
          <Stack direction="row" spacing={1} className="social-links" aria-label={t("Social media links")}>
            <IconButton component="a" href="https://www.facebook.com/" target="_blank" rel="noreferrer" aria-label={t("Facebook demo link")}><FacebookIcon /></IconButton>
            <IconButton component="a" href="https://www.instagram.com/" target="_blank" rel="noreferrer" aria-label={t("Instagram demo link")}><InstagramIcon /></IconButton>
            <IconButton component="a" href="https://www.youtube.com/" target="_blank" rel="noreferrer" aria-label={t("YouTube demo link")}><YouTubeIcon /></IconButton>
          </Stack>
          <Typography variant="caption" className="footer-muted">{t("Social links are placeholders until official profiles are added.")}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="subtitle2" className="footer-label">{t("EXPLORE")}</Typography>
          <Stack spacing={1}><Link href="#register" underline="hover">{t("Membership registration")}</Link><Link href="/admin" underline="hover">{t("Administrator")}</Link></Stack>
        </Grid>
        <Grid item xs={6} md={4}>
          <Typography variant="subtitle2" className="footer-label">{t("NEED HELP?")}</Typography>
          <Typography variant="body2" className="footer-muted">{t("Open the menu above for contact details, directions, and the approximate map pin.")}</Typography>
          <Link className="footer-contact-link" href={`tel:${phone}`}>{t("Call the library")}</Link>
        </Grid>
      </Grid>
      <Divider className="footer-divider" />
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1}>
        <Typography variant="caption" className="footer-muted">© {year} · {t("Learn")} · {t("Prepare")} · {t("Succeed")}</Typography>
        <Typography variant="caption" className="footer-muted">{t("Membership subject to library rules and availability.")}</Typography>
      </Stack>
    </Container>
  </Box>;
}
