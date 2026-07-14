use std::net::TcpListener;

use bunker::{get_config, run};
use sqlx::PgPool;

#[tokio::main]
async fn main() {
    env_logger::init_from_env(env_logger::Env::default().default_filter_or("info"));
    log::info!("Fetching configuration");
    let config = get_config().expect("Failed to load configuration");
    log::info!("Configuration loaded successfully!");
    let lst =
        TcpListener::bind(format!("0.0.0.0:{}", config.port)).expect("Failed to bind to address");

    log::info!("Connecting to the database");
    let db_pool = PgPool::connect(&config.database.db_url())
        .await
        .expect("Failed to connect to the database");
    log::info!("Database connection established successfully!");

    run(lst, db_pool, config.storage_path).await;
}
