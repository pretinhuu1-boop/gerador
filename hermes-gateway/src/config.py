from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # OpenRouter
    openrouter_api_key: str = Field(default="", alias="OPENROUTER_API_KEY")
    openrouter_base_url: str = Field(
        default="https://openrouter.ai/api/v1", alias="OPENROUTER_BASE_URL"
    )

    # Models
    hermes_model_orchestrator: str = Field(
        default="nousresearch/hermes-4.3-36b", alias="HERMES_MODEL_ORCHESTRATOR"
    )
    hermes_model_agent: str = Field(default="nousresearch/hermes-4-14b", alias="HERMES_MODEL_AGENT")
    hermes_model_improver: str = Field(
        default="nousresearch/hermes-4.3-36b", alias="HERMES_MODEL_IMPROVER"
    )

    # Supabase
    supabase_url: str = Field(default="http://host.docker.internal:54321", alias="SUPABASE_URL")
    supabase_service_role_key: str = Field(default="", alias="SUPABASE_SERVICE_ROLE_KEY")
    supabase_jwt_secret: str = Field(default="", alias="SUPABASE_JWT_SECRET")

    # YouTube
    youtube_api_key: str = Field(default="", alias="YOUTUBE_API_KEY")

    # CORS
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:5173", alias="ALLOWED_ORIGINS")

    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
