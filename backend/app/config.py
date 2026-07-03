from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./taskdb.db"
    environment: str = "development"
    debug: bool = True
    cors_origins: list[str] = ["http://localhost:5173", "http://localhost:3000"]
    api_secret_token: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
