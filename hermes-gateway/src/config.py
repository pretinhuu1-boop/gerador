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

    # Google OAuth (YouTube upload via OAuth flow — distinct from the public Data API key)
    google_oauth_client_id: str = Field(default="", alias="GOOGLE_OAUTH_CLIENT_ID")
    google_oauth_client_secret: str = Field(default="", alias="GOOGLE_OAUTH_CLIENT_SECRET")
    google_oauth_redirect_uri: str = Field(
        default="http://localhost:8088/v1/oauth/google/callback",
        alias="GOOGLE_OAUTH_REDIRECT_URI",
    )
    # Where to send the user back after a successful connect (frontend URL).
    oauth_success_redirect: str = Field(
        default="http://localhost:5173/?connected=youtube",
        alias="OAUTH_SUCCESS_REDIRECT",
    )

    # External pipelines (Phase 3) — opt-in HTTP services the user runs separately.
    # Tools `assemble_video`, `extract_clips`, `generate_talking_head` only register
    # when these URLs are non-empty.
    external_video_assembler_url: str = Field(
        default="", alias="EXTERNAL_VIDEO_ASSEMBLER_URL"
    )
    external_clip_extractor_url: str = Field(
        default="", alias="EXTERNAL_CLIP_EXTRACTOR_URL"
    )
    external_talking_head_url: str = Field(
        default="", alias="EXTERNAL_TALKING_HEAD_URL"
    )

    # ElevenLabs (TTS)
    elevenlabs_api_key: str = Field(default="", alias="ELEVENLABS_API_KEY")
    elevenlabs_default_voice: str = Field(
        default="21m00Tcm4TlvDq8ikWAM", alias="ELEVENLABS_DEFAULT_VOICE"
    )
    elevenlabs_model: str = Field(default="eleven_multilingual_v2", alias="ELEVENLABS_MODEL")

    # Gemini (used for text embeddings + multimodal Phase 3)
    gemini_api_key: str = Field(default="", alias="GEMINI_API_KEY")
    gemini_embedding_model: str = Field(
        default="text-embedding-004", alias="GEMINI_EMBEDDING_MODEL"
    )

    # OpenRouter fallback chain for the orchestrator + agents.
    # Comma-separated model slugs; first is primary, rest are fallbacks.
    hermes_fallback_models: str = Field(
        default="", alias="HERMES_FALLBACK_MODELS"
    )

    # Render pipeline
    render_node_bin: str = Field(default="npx", alias="RENDER_NODE_BIN")
    render_remotion_entry: str = Field(
        default="/app/remotion/Root.tsx", alias="RENDER_REMOTION_ENTRY"
    )
    render_workdir: str = Field(default="/tmp/channel-os-renders", alias="RENDER_WORKDIR")
    render_storage_bucket: str = Field(default="renders", alias="RENDER_STORAGE_BUCKET")

    @property
    def hermes_fallback_models_list(self) -> list[str]:
        return [m.strip() for m in self.hermes_fallback_models.split(",") if m.strip()]

    # CORS
    allowed_origins: str = Field(default="http://localhost:3000,http://localhost:5173", alias="ALLOWED_ORIGINS")

    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    @property
    def allowed_origins_list(self) -> list[str]:
        return [o.strip() for o in self.allowed_origins.split(",") if o.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
