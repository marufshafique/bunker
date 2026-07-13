use config::{Config, ConfigError};

#[derive(serde::Deserialize)]
pub struct Settings {
    pub port: u16,
    pub storage_path: String,
    pub database: DatabaseSettings,
}

#[derive(serde::Deserialize)]
pub struct DatabaseSettings {
    pub username: String,
    pub password: String,
    pub host: String,
    pub port: u16,
    pub database_name: String,
}

pub fn get_config() -> Result<Settings, ConfigError> {
    let settings = Config::builder()
        .add_source(config::File::with_name("config"))
        .add_source(
            config::Environment::default()
                .separator("__"),
        )
        .build();

    settings?.try_deserialize::<Settings>()
}

impl DatabaseSettings {
    pub fn db_url(&self) -> String {
        format!(
            "postgres://{}:{}@{}:{}/{}",
            self.username, self.password, self.host, self.port, self.database_name
        )
    }
}
