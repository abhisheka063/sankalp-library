import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { SvgIcon } from "@mui/material";
import { X } from "lucide-react";
import type { PublicConfig } from "../../types";
import { useLanguage } from "../../utils/i18n";

const MAP_URL = "https://www.google.com/maps?q=26.2196,84.3567&z=14&output=embed";

function MenuGlyph() {
  return <SvgIcon><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z" /></SvgIcon>;
}

function ThemeGlyph({ mode }: { mode: "light" | "dark" }) {
  return <SvgIcon>{mode === "dark"
    ? <path d="M12 2a9 9 0 1 0 10 12A8 8 0 0 1 12 2Z" />
    : <path fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" d="M12 3v2m0 14v2M3 12h2m14 0h2M5.64 5.64l1.42 1.42m9.88 9.88 1.42 1.42m0-12.72-1.42 1.42m-9.88 9.88-1.42 1.42M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />}
  </SvgIcon>;
}

function scrollToSection(id: string, close: () => void) {
  close();
  window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
}

export function LibraryHeader({ config, mode, onToggleMode }: { config: PublicConfig | null; mode: "light" | "dark"; onToggleMode: () => void }) {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const close = () => setOpen(false);
  const phone = config?.phone || "9939697490";

  return <>
    <AppBar className="library-appbar" position="static" elevation={0} color="transparent">
      <Toolbar disableGutters className="library-toolbar">
        <Link className="brand-link" href="/" underline="none" aria-label={t("Sankalp Library home")}>
          <Avatar className="library-logo" variant="rounded" src="/assets/sankalp-library-emblem.png" alt="Sankalp Library sunrise emblem" />
          <Box className="brand-copy">
            <Typography component="strong" className="brand-hindi">संकल्प</Typography>
            <Typography component="span" className="brand-library">LIBRARY</Typography>
            <Typography component="span" className="brand-tagline" variant="caption">LEARN · PREPARE · SUCCEED</Typography>
          </Box>
        </Link>
        <Box className="header-actions">
          <Button className="language-toggle" variant="outlined" size="small" aria-label={t(language === "en" ? "Switch language to Hindi" : "Switch language to English")} onClick={() => setLanguage(language === "en" ? "hi" : "en")}>{language === "en" ? "हिंदी" : "English"}</Button>
          <IconButton className="theme-toggle" aria-label={t(mode === "dark" ? "Switch to light mode" : "Switch to dark mode")} title={t(mode === "dark" ? "Switch to light mode" : "Switch to dark mode")} onClick={onToggleMode} color="primary"><ThemeGlyph mode={mode} /></IconButton>
          <IconButton className="menu-toggle" aria-label={t("Open navigation menu")} aria-expanded={open} onClick={() => setOpen(true)} color="primary"><MenuGlyph /></IconButton>
        </Box>
      </Toolbar>
    </AppBar>

    <Drawer anchor="right" open={open} onClose={close} PaperProps={{ className: "navigation-drawer" }}>
      <Box className="drawer-top">
        <Box className="drawer-brand-lockup" aria-label={t("Sankalp Library home")}>
          <Avatar className="library-logo drawer-library-logo" variant="rounded" src="/assets/sankalp-library-emblem.png" alt="" />
          <Box className="brand-copy">
            <Typography component="strong" className="brand-hindi">संकल्प</Typography>
            <Typography component="span" className="brand-library">LIBRARY</Typography>
            <Typography component="span" className="brand-tagline" variant="caption">LEARN · PREPARE · SUCCEED</Typography>
          </Box>
        </Box>
        <IconButton aria-label={t("Close navigation menu")} title={t("Close navigation menu")} onClick={close} color="primary"><X size={19} /></IconButton>
      </Box>
      <List>
        <ListItemButton onClick={() => document.getElementById("drawer-contact")?.scrollIntoView({ behavior: "smooth", block: "start" })}><ListItemText primary={t("Contact and directions")} secondary={t("Address, phone, and map")} /></ListItemButton>
        <ListItemButton component="a" href="/admin" onClick={close}><ListItemText primary={t("Admin")} secondary={t("Administrator dashboard")} /></ListItemButton>
      </List>
      <Divider />
      <Box id="drawer-contact" className="drawer-contact">
        <Typography variant="overline" color="primary">{t("CONTACT")}</Typography>
        <Typography variant="subtitle1" fontWeight={700}>{t("Visit or call us")}</Typography>
        <Typography variant="body2">{t(config?.address || "Newari More, Tari Bazaar Road, Raghunathpur, Siwan, Bihar, India")}</Typography>
        <Link href={`tel:${phone}`} className="drawer-phone">{t("Call")} {phone}</Link>
        <Typography className="map-note" variant="caption">{t("Approximate map pin · Siwan, Bihar 841509")}</Typography>
        <Box className="map-frame"><iframe title={t("Approximate Sankalp Library location in Siwan, Bihar")} src={MAP_URL} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /></Box>
      </Box>
      <Divider />
      <Box className="drawer-bottom"><Typography variant="caption">{t("Map marker is an approximate city location and may not identify the library building.")}</Typography><Button onClick={() => scrollToSection("footer-social", close)}>{t("Social media")}</Button></Box>
    </Drawer>
  </>;
}
