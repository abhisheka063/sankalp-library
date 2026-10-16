# Separate free-tier deployments

The frontend is configured for Vercel (`frontend/` as the project root). The FastAPI service is configured for Render with `render.yaml`. They receive separate URLs; set `VITE_API_URL` in Vercel to the Render API URL (without a trailing slash), then redeploy the frontend. Set `FRONTEND_URL` in Render to the exact Vercel origin, such as `https://sankalp-library.vercel.app`, and set `CORS_ORIGINS` to that origin plus any additional trusted origins.

On Render, set `DATABASE_URL` to a durable PostgreSQL provider connection string, `ADMIN_USERNAME`, and a strong unique `ADMIN_PASSWORD`. Set `SECRET_KEY` to a strong random value. Do not put secrets in Vercel's frontend environment: Vite variables are included in browser code. Vercel should only receive the public API URL.

Free Render web services sleep after 15 minutes without traffic, so their first request can take about a minute. Their filesystem is ephemeral; this service stores only regenerated PDFs under `/tmp`, while registrations must live in PostgreSQL. Use a database with backups before accepting real membership records. Supabase's free database becomes read-only after its 500 MB database quota. Review provider limits and privacy terms before putting personal data into any free hosted service.

## Connect and deploy

1. Push this project to a Git provider account.
2. In Vercel, import the repository, set the project root to `frontend`, and configure `VITE_API_URL` after the API service is created.
3. In Render, create a Blueprint from the repository and fill in the required values in the dashboard. Render builds from `render.yaml`.
4. Copy the Render URL into Vercel's `VITE_API_URL`, and copy the Vercel origin into Render's `FRONTEND_URL` and `CORS_ORIGINS`.
5. Redeploy both and check `https://<api-host>/health`, then submit a test registration and verify the generated PDF.
