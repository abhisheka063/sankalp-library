import { Paper, Typography } from "@mui/material";

export function PromotionalPoster() {
  return <Paper component="figure" elevation={1} className="poster-card">
    <img src="/assets/sankalp-library-poster.png" alt="Sankalp Library promotional poster with logo, study room, facilities, phone number, and address." />
    <Typography component="figcaption" variant="caption">संकल्प लाइब्रेरी · शांत वातावरण · बेहतर सुविधा · उज्ज्वल भविष्य</Typography>
  </Paper>;
}
