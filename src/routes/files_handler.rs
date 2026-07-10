use std::path::PathBuf;

use actix_multipart::form::{MultipartForm, tempfile::TempFile};
use actix_web::{HttpResponse, Responder, delete, get, post, web::Data};
use sqlx::{PgPool, types::chrono};
use uuid;

#[derive(MultipartForm)]
pub struct FileForm {
    file: TempFile,
}

#[derive(serde::Serialize)]
pub struct FileResponse {
    id: uuid::Uuid,
    original_name: String,
    file_size_bytes: usize,
    mime_type: String,
    storage_path: String,
    uploaded_at: chrono::DateTime<chrono::Utc>,
}

#[post("/files")]
pub async fn upload_file(
    MultipartForm(form): MultipartForm<FileForm>,
    db_pool: Data<PgPool>,
) -> impl Responder {
    log::info!("Received file: {:?}", form.file.file_name);
    let original_name = form
        .file
        .file_name
        .clone()
        .unwrap_or_else(|| "unknown_file.bin".to_string());
    let target_path = PathBuf::from("uploads").join(&original_name);

    form.file
        .file
        .persist(&target_path)
        .expect("Failed to save the uploaded file");
    if let Some(file_type) = &form.file.content_type {
        log::info!("File content type: {}", file_type.to_string());
    } else {
        log::warn!("File content type is not available");
    }

    let res = FileResponse {
        id: uuid::Uuid::new_v4(),
        original_name,
        file_size_bytes: form.file.size,
        mime_type: form.file.content_type.unwrap().to_string(),
        storage_path: target_path.to_string_lossy().to_string(),
        uploaded_at: chrono::Utc::now(),
    };

    sqlx::query!(
        r#"
        INSERT INTO files (id, original_name, storage_path, file_size_bytes, mime_type, uploaded_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        "#,
        res.id,
        res.original_name,
        res.storage_path,
        res.file_size_bytes as i64,
        res.mime_type,
        res.uploaded_at
    )
    .execute(db_pool.get_ref())
    .await
    .expect("Failed to insert file metadata into the database");

    HttpResponse::Ok().json(res)
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
