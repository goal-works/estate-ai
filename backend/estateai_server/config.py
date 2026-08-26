from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="ESTATEAI_", env_file=".env")

    app_name: str = "EstateAI"
    database_url: str = "sqlite:///./estateai.db"
    cors_origins: str = "http://localhost:3002,http://127.0.0.1:3002"
    seed_demo_data: bool = True

    @property
    def allowed_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
