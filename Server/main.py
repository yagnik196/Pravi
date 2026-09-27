from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any, Dict
import datetime
from bson import ObjectId

from database import (
    get_mysql_connection,
    init_mysql,
    check_mysql_health,
    get_mongo_db,
    init_mongodb,
    check_mongo_health,
    MYSQL_DATABASE,
    MONGO_DATABASE,
)

app = FastAPI(
    title="Pravi Multi-Database API (MySQL & MongoDB)",
    description="FastAPI skeleton connecting to MySQL and MongoDB with complete CRUD support.",
    version="1.0.0",
)

# Enable CORS for frontend applications (Vite React etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================================
# Pydantic Models
# ============================================================================

# MySQL Models (Users Table)
class UserCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, example="Alice Smith")
    email: str = Field(..., max_length=100, example="alice@example.com")
    role: Optional[str] = Field(default="User", max_length=50, example="Developer")

class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = Field(None, max_length=100)
    role: Optional[str] = Field(None, max_length=50)

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: Any
    updated_at: Any


# MongoDB Models (Items Collection)
class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=150, example="Cloud Server")
    category: Optional[str] = Field(default="General", example="Infrastructure")
    price: float = Field(..., ge=0.0, example=99.99)
    in_stock: Optional[bool] = Field(default=True)
    tags: Optional[List[str]] = Field(default_factory=list, example=["compute", "cloud"])

class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = Field(None, ge=0.0)
    in_stock: Optional[bool] = None
    tags: Optional[List[str]] = None


# Helper to convert MongoDB document for JSON responses
def serialize_mongo_doc(doc: Dict[str, Any]) -> Dict[str, Any]:
    if not doc:
        return doc
    doc["id"] = str(doc.pop("_id"))
    return doc


# ============================================================================
# Startup & Health Checks
# ============================================================================

@app.on_event("startup")
def startup_event():
    print("[Startup] Initializing databases...")
    mysql_res = init_mysql()
    if mysql_res["success"]:
        print(f"[MySQL] {mysql_res['message']}")
    else:
        print(f"[MySQL Warning] {mysql_res['error']}")

    mongo_res = init_mongodb()
    if mongo_res["success"]:
        print(f"[MongoDB] {mongo_res['message']}")
    else:
        print(f"[MongoDB Warning] {mongo_res['error']}")


@app.get("/", tags=["General"])
def root():
    return {
        "service": "Pravi Multi-DB FastAPI Service",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/health",
            "mysql_crud": "/api/mysql/users",
            "mongodb_crud": "/api/mongo/items"
        }
    }


@app.get("/api/health", tags=["Health"])
def health_check():
    """Returns connectivity status for both MySQL and MongoDB."""
    mysql_health = check_mysql_health()
    mongo_health = check_mongo_health()

    is_all_healthy = (
        mysql_health["status"] == "connected" and
        mongo_health["status"] == "connected"
    )

    return {
        "status": "healthy" if is_all_healthy else "degraded",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "databases": {
            "mysql": mysql_health,
            "mongodb": mongo_health
        }
    }


# ============================================================================
# MySQL CRUD Endpoints (/api/mysql/users)
# ============================================================================

@app.post("/api/mysql/users", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, tags=["MySQL CRUD"])
def create_mysql_user(user: UserCreate):
    """Create a new user in MySQL."""
    try:
        conn = get_mysql_connection()
        with conn.cursor() as cursor:
            # Check for duplicate email
            cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="User with this email already exists")

            insert_sql = "INSERT INTO users (name, email, role) VALUES (%s, %s, %s)"
            cursor.execute(insert_sql, (user.name.strip(), user.email.strip(), user.role.strip()))
            new_id = cursor.lastrowid

            cursor.execute("SELECT * FROM users WHERE id = %s", (new_id,))
            created_user = cursor.fetchone()
        conn.close()
        return {"success": True, "data": created_user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/mysql/users", response_model=Dict[str, Any], tags=["MySQL CRUD"])
def list_mysql_users():
    """Retrieve all users from MySQL."""
    try:
        conn = get_mysql_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users ORDER BY id DESC")
            users = cursor.fetchall()
        conn.close()
        return {"success": True, "count": len(users), "data": users}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/api/mysql/users/{user_id}", response_model=Dict[str, Any], tags=["MySQL CRUD"])
def get_mysql_user(user_id: int):
    """Retrieve a single user by ID from MySQL."""
    try:
        conn = get_mysql_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cursor.fetchone()
        conn.close()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return {"success": True, "data": user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.put("/api/mysql/users/{user_id}", response_model=Dict[str, Any], tags=["MySQL CRUD"])
def update_mysql_user(user_id: int, update: UserUpdate):
    """Update user fields in MySQL."""
    fields = []
    values = []
    if update.name is not None:
        fields.append("name = %s")
        values.append(update.name.strip())
    if update.email is not None:
        fields.append("email = %s")
        values.append(update.email.strip())
    if update.role is not None:
        fields.append("role = %s")
        values.append(update.role.strip())

    if not fields:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    try:
        conn = get_mysql_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=404, detail="User not found")

            values.append(user_id)
            sql = f"UPDATE users SET {', '.join(fields)} WHERE id = %s"
            cursor.execute(sql, tuple(values))

            cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            updated_user = cursor.fetchone()
        conn.close()
        return {"success": True, "data": updated_user}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.delete("/api/mysql/users/{user_id}", response_model=Dict[str, Any], tags=["MySQL CRUD"])
def delete_mysql_user(user_id: int):
    """Delete a user record from MySQL."""
    try:
        conn = get_mysql_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT id FROM users WHERE id = %s", (user_id,))
            if not cursor.fetchone():
                conn.close()
                raise HTTPException(status_code=404, detail="User not found")

            cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
        conn.close()
        return {"success": True, "message": f"User ID {user_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ============================================================================
# MongoDB CRUD Endpoints (/api/mongo/items)
# ============================================================================

@app.post("/api/mongo/items", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED, tags=["MongoDB CRUD"])
def create_mongo_item(item: ItemCreate):
    """Create a new item document in MongoDB."""
    try:
        db = get_mongo_db()
        doc = item.model_dump()
        doc["created_at"] = datetime.datetime.utcnow().isoformat()
        result = db.items.insert_one(doc)
        created_doc = db.items.find_one({"_id": result.inserted_id})
        return {"success": True, "data": serialize_mongo_doc(created_doc)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")


@app.get("/api/mongo/items", response_model=Dict[str, Any], tags=["MongoDB CRUD"])
def list_mongo_items():
    """Retrieve all items from MongoDB collection."""
    try:
        db = get_mongo_db()
        items = [serialize_mongo_doc(doc) for doc in db.items.find()]
        return {"success": True, "count": len(items), "data": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")


@app.get("/api/mongo/items/{item_id}", response_model=Dict[str, Any], tags=["MongoDB CRUD"])
def get_mongo_item(item_id: str):
    """Retrieve a single item by its MongoDB ObjectId."""
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid MongoDB ObjectId format")

    try:
        db = get_mongo_db()
        doc = db.items.find_one({"_id": obj_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"success": True, "data": serialize_mongo_doc(doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")


@app.put("/api/mongo/items/{item_id}", response_model=Dict[str, Any], tags=["MongoDB CRUD"])
def update_mongo_item(item_id: str, update: ItemUpdate):
    """Update fields of an item in MongoDB."""
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid MongoDB ObjectId format")

    update_data = {k: v for k, v in update.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided to update")

    update_data["updated_at"] = datetime.datetime.utcnow().isoformat()

    try:
        db = get_mongo_db()
        result = db.items.update_one({"_id": obj_id}, {"$set": update_data})
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")

        updated_doc = db.items.find_one({"_id": obj_id})
        return {"success": True, "data": serialize_mongo_doc(updated_doc)}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")


@app.delete("/api/mongo/items/{item_id}", response_model=Dict[str, Any], tags=["MongoDB CRUD"])
def delete_mongo_item(item_id: str):
    """Delete an item from MongoDB by ObjectId."""
    try:
        obj_id = ObjectId(item_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid MongoDB ObjectId format")

    try:
        db = get_mongo_db()
        result = db.items.delete_one({"_id": obj_id})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Item not found")
        return {"success": True, "message": f"Item {item_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MongoDB error: {str(e)}")
