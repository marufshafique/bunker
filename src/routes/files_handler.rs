use actix_web::{
    HttpResponse, Responder, delete, get, post,
    web::{Data, Form},
};
use sqlx::{PgPool, types::chrono};

#[derive(serde::Deserialize)]
pub struct FileForm {
    original_name: String,
    storage_path: String,
    file_size_bytes: usize,
    mime_type: String,
}

#[post("/files")]
pub async fn upload_file(form: Form<FileForm>, db_pool: Data<PgPool>) -> impl Responder {
    let uploaded_at = chrono::Utc::now();

    sqlx::query!(
        r#"
        INSERT INTO files (original_name, storage_path, file_size_bytes, mime_type, uploaded_at)
        VALUES ($1, $2, $3, $4, $5)
        "#,
        form.original_name,
        form.storage_path,
        form.file_size_bytes as i64,
        form.mime_type,
        uploaded_at
    )
    .execute(db_pool.get_ref())
    .await
    .expect("Failed to insert file metadata into the database");

    // todo!();
    HttpResponse::Ok().body("File uploaded successfully")
}

#[get("/files")]
pub async fn list_files() -> impl Responder {
    // todo!();
    HttpResponse::Ok().body("List of files")
}

#[get("/files/{id}")]
pub async fn get_file() -> impl Responder {
    // todo!();
    HttpResponse::Ok().body("File content")
}

#[delete("/files/{id}")]
pub async fn delete_file() -> impl Responder {
    // todo!();
    HttpResponse::Ok().body("File deleted successfully")
}

#[get("/files/{id}/download")]
pub async fn download_file() -> impl Responder {
    // todo!();
    HttpResponse::Ok().body("File download")
}
