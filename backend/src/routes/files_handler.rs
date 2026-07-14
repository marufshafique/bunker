use std::path::PathBuf;

use actix_multipart::form::{MultipartForm, tempfile::TempFile};
use actix_web::{
    HttpResponse, Responder, delete, get, post,
    web::{self, Data, Query},
};
use sqlx::{PgPool, types::chrono};
use uuid;

use crate::StorageConfig;

#[derive(serde::Deserialize, std::fmt::Debug)]
pub struct FilesQuery {
    folder_id: Option<uuid::Uuid>,
    folder_name: Option<String>,
}

#[derive(MultipartForm)]
pub struct FileForm {
    file: TempFile,
}

#[derive(sqlx::FromRow, serde::Serialize)]
pub struct FileRow {
    id: uuid::Uuid,
    original_name: String,
    storage_path: String,
    file_size_bytes: i32,
    mime_type: String,
    uploaded_at: chrono::DateTime<chrono::Utc>,
    folder_id: Option<uuid::Uuid>,
}

#[post("/files")]
pub async fn upload_file(
    MultipartForm(form): MultipartForm<FileForm>,
    Query(query): Query<FilesQuery>,
    db_pool: Data<PgPool>,
    storage: Data<StorageConfig>,
) -> impl Responder {
    log::info!("Received file: {:?}", form.file.file_name);
    let original_name = form
        .file
        .file_name
        .unwrap_or_else(|| "unknown_file.bin".to_string());

    let id = uuid::Uuid::new_v4();

    log::info!("Uploading file on folder: {:?}", query);
    let target_path = if let Some(ref folder_name) = query.folder_name {
        storage.base_path.join(&folder_name).join(&original_name)
    } else {
        storage.base_path.join(&original_name)
    };

    // Use copy instead of persist() to avoid "cross-device link" errors
    // when /tmp and the uploads volume are on different filesystems (Docker).
    if let Some(parent) = target_path.parent() {
        std::fs::create_dir_all(parent).expect("Failed to create upload directory");
    }
    std::fs::copy(form.file.file.path(), &target_path)
        .expect("Failed to save the uploaded file");
    if let Some(file_type) = &form.file.content_type {
        log::info!("File content type: {}", file_type.to_string());
    } else {
        log::warn!("File content type is not available");
    }

    let res = FileRow {
        id,
        original_name,
        file_size_bytes: form.file.size as i32,
        mime_type: form.file.content_type.unwrap().to_string(),
        storage_path: target_path.to_string_lossy().to_string(),
        uploaded_at: chrono::Utc::now(),
        folder_id: query.folder_id,
    };

    sqlx::query!(
        r#"
        INSERT INTO files (id, original_name, storage_path, file_size_bytes, mime_type, uploaded_at, folder_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        "#,
        res.id,
        res.original_name,
        res.storage_path,
        res.file_size_bytes as i64,
        res.mime_type,
        res.uploaded_at,
        res.folder_id
    )
    .execute(db_pool.get_ref())
    .await
    .expect("Failed to insert file metadata into the database");

    HttpResponse::Ok().json(res)
}

#[get("/files")]
pub async fn list_files(
    Query(params): Query<FilesQuery>,
    db_pool: web::Data<PgPool>,
) -> impl Responder {
    let mut builder = sqlx::QueryBuilder::new("SELECT * FROM files");
    if let Some(ref folder_id) = params.folder_id {
        builder.push(" WHERE folder_id = ");
        builder.push_bind(folder_id);
    } else {
        builder.push(" WHERE folder_id IS NULL");
    }
    let files = builder
        .build_query_as::<FileRow>()
        .fetch_all(db_pool.get_ref())
        .await
        .expect("Failed to fetch files from the database");

    HttpResponse::Ok().json(files)
}

#[get("/files/{id}")]
pub async fn get_file(id: web::Path<uuid::Uuid>, db_pool: web::Data<PgPool>) -> impl Responder {
    let file = sqlx::query_as!(FileRow, "SELECT * FROM files WHERE id = $1", *id)
        .fetch_optional(db_pool.get_ref())
        .await
        .expect("Failed to fetch file from the database");

    match file {
        Some(file) => HttpResponse::Ok().json(file),
        None => HttpResponse::NotFound().body("File not found"),
    }
}

#[delete("/files/{id}")]
pub async fn delete_file(id: web::Path<uuid::Uuid>, db_pool: web::Data<PgPool>) -> impl Responder {
    let file = sqlx::query_as!(FileRow, "SELECT * FROM files WHERE id = $1", *id)
        .fetch_optional(db_pool.get_ref())
        .await
        .expect("Failed to fetch file from the database");

    let file = match file {
        Some(file) => file,
        None => return HttpResponse::NotFound().body("File not found"),
    };

    let storage_path = PathBuf::from(&file.storage_path);
    if storage_path.exists() {
        std::fs::remove_file(&storage_path).expect("Failed to delete file from storage");
    }

    sqlx::query!("DELETE FROM files WHERE id = $1", *id)
        .execute(db_pool.get_ref())
        .await
        .expect("Failed to delete file from the database");

    HttpResponse::Ok().body("File deleted successfully")
}

#[get("/files/{id}/download")]
pub async fn download_file(
    id: web::Path<uuid::Uuid>,
    db_pool: web::Data<PgPool>,
) -> impl Responder {
    let file = sqlx::query_as!(FileRow, "SELECT * FROM files WHERE id = $1", *id)
        .fetch_optional(db_pool.get_ref())
        .await
        .expect("Failed to fetch file from the database");

    let file = match file {
        Some(file) => file,
        None => return HttpResponse::NotFound().body("File not found"),
    };

    let bytes = tokio::fs::read(&file.storage_path)
        .await
        .expect("Failed to read file from storage");

    HttpResponse::Ok()
        .insert_header((
            "Content-Disposition",
            format!("attachment; filename=\"{}\"", file.original_name),
        ))
        .content_type(file.mime_type)
        .body(bytes)
}
