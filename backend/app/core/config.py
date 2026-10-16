from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg://sankalp:sankalp@db:5432/sankalp"
    secret_key: str = "change-me-before-deployment"
    admin_username: str = "admin"
    admin_password: str = "change-me-now"
    public_url: str = "http://localhost:5173"
    frontend_url: str = "http://localhost:5173"
    library_name: str = "Sankalp Library"
    library_address: str = "Newari More, Tari Bazaar Road, Raghunathpur, Siwan, Bihar, India"
    contact_phone: str = "9939697490"
    terms: str = "I agree to follow library rules, maintain silence, and pay applicable membership fees."
    storage_dir: str = "./data"
    cors_origins: str = "http://localhost:5173"

    @property
    def allowed_origins(self) -> list[str]:
        """Combine explicitly configured origins with the deployed frontend origin."""
        origins = [origin.strip().rstrip("/") for origin in self.cors_origins.split(",") if origin.strip()]
        frontend = self.frontend_url.strip().rstrip("/")
        if frontend and frontend not in origins:
            origins.append(frontend)
        return origins

    model_config = SettingsConfigDict(env_file="../.env", extra="ignore")


settings = Settings()
