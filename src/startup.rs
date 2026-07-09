use std::net::TcpListener;

use actix_web::{App, HttpServer, web};
use sqlx::PgPool;

use crate::{delete_file, download_file, get_file, list_files, upload_file};

pub async fn run(lst: TcpListener, db_pool: PgPool) {
    let db_pool = web::Data::new(db_pool);

    HttpServer::new(move || {
        App::new()
            .service(upload_file)
            .service(list_files)
            .service(get_file)
            .service(delete_file)
            .service(download_file)
            .app_data(db_pool.clone())
    })
    .listen(lst)
    .expect("Failed to bind to address")
    .run()
    .await
    .expect("Failed to run server");
}
