use std::net::TcpListener;
use std::path::PathBuf;

use actix_cors::Cors;
use actix_web::{App, HttpServer, web};
use sqlx::PgPool;

use crate::{
    StorageConfig, create_folder, delete_file, delete_folder, download_file, get_file, get_folder,
    get_folders, list_files, upload_file,
};

pub async fn run(lst: TcpListener, db_pool: PgPool, storage_path: String) {
    let db_pool = web::Data::new(db_pool);
    let storage = web::Data::new(StorageConfig {
        base_path: PathBuf::from(storage_path),
    });

    HttpServer::new(move || {
        App::new()
            .wrap(Cors::permissive())
            .app_data(db_pool.clone())
            .app_data(storage.clone())
            .service(upload_file)
            .service(list_files)
            .service(get_file)
            .service(delete_file)
            .service(download_file)
            .service(create_folder)
            .service(get_folders)
            .service(get_folder)
            .service(delete_folder)
    })
    .listen(lst)
    .expect("Failed to bind to address")
    .run()
    .await
    .expect("Failed to run server");
}
