use actix_web::{
    HttpResponse, Responder, delete, get, post,
    web::{Data, Json, Path, Query},
};
use sqlx::{PgPool, types::chrono};
use uuid;

use crate::StorageConfig;

#[derive(serde::Deserialize)]
pub struct CreateFolderRequest {
    name: String,
    folder_id: Option<uuid::Uuid>,
}

#[derive(serde::Deserialize, Debug)]
pub struct FoldersQuery {
    folder_id: Option<uuid::Uuid>,
}

#[derive(sqlx::FromRow, serde::Serialize)]
pub struct FolderRow {
    id: uuid::Uuid,
    name: String,
    folder_id: Option<uuid::Uuid>,
    created_at: chrono::DateTime<chrono::Utc>,
}

#[post("/folders")]
pub async fn create_folder(
    Json(body): Json<CreateFolderRequest>,
    db_pool: Data<PgPool>,
    storage: Data<StorageConfig>,
) -> impl Responder {
    let id = uuid::Uuid::new_v4();

    let folder_path = storage.base_path.join(&body.name);
    std::fs::create_dir_all(&folder_path).expect("Failed to create folder directory");

    let folder = FolderRow {
        id,
        name: body.name,
        folder_id: body.folder_id,
        created_at: chrono::Utc::now(),
    };

    sqlx::query!(
        r#"
        INSERT INTO folders (id, name, folder_id, created_at)
        VALUES ($1, $2, $3, $4)
        "#,
        folder.id,
        folder.name,
        folder.folder_id,
        folder.created_at
    )
    .execute(db_pool.get_ref())
    .await
    .expect("Failed to insert folder into the database");

    HttpResponse::Ok().json(folder)
}

#[get("/folders")]
pub async fn get_folders(
    Query(params): Query<FoldersQuery>,
    db_pool: Data<PgPool>,
) -> impl Responder {
    log::info!("Fetching folders with params: {:?}", params);
    let mut builder = sqlx::QueryBuilder::new("SELECT * FROM folders");
    if let Some(ref folder_id) = params.folder_id {
        builder.push(" WHERE folder_id = ");
        builder.push_bind(folder_id);
    } else {
        builder.push(" WHERE folder_id IS NULL");
    }
    let folders = builder
        .build_query_as::<FolderRow>()
        .fetch_all(db_pool.get_ref())
        .await
        .expect("Failed to fetch folders from the database");

    HttpResponse::Ok().json(folders)
}

#[get("/folders/{id}")]
pub async fn get_folder(id: Path<uuid::Uuid>, db_pool: Data<PgPool>) -> impl Responder {
    log::info!("Fetching folder with id: {:?}", id);
    let folder = sqlx::query_as!(FolderRow, "SELECT * FROM folders WHERE id = $1", *id)
        .fetch_optional(db_pool.get_ref())
        .await
        .expect("Failed to fetch folder from the database");

    match folder {
        Some(folder) => HttpResponse::Ok().json(folder),
        None => HttpResponse::NotFound().body("Folder not found"),
    }
}

#[delete("/folders/{id}")]
pub async fn delete_folder(id: Path<uuid::Uuid>, db_pool: Data<PgPool>) -> impl Responder {
    let folder = sqlx::query_as!(FolderRow, "SELECT * FROM folders WHERE id = $1", *id)
        .fetch_optional(db_pool.get_ref())
        .await
        .expect("Failed to fetch folder from the database");

    if folder.is_none() {
        return HttpResponse::NotFound().body("Folder not found");
    }

    sqlx::query!("DELETE FROM folders WHERE id = $1", *id)
        .execute(db_pool.get_ref())
        .await
        .expect("Failed to delete folder from the database");

    HttpResponse::Ok().body("Folder deleted successfully")
}
