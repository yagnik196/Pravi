import os
import pymysql
import pymysql.cursors
from pymongo import MongoClient
from dotenv import load_dotenv
from typing import Dict, Any, Optional

# Load environment variables
load_dotenv()

# MySQL Configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "pravi_db")

# MongoDB Configuration
MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017")
MONGO_DATABASE = os.getenv("MONGO_DATABASE", "pravi_db")


# ============================================================================
# MySQL Helper Functions
# ============================================================================

def get_mysql_server_connection():
    """Connect to MySQL server instance without selecting a database."""
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        connect_timeout=3
    )

def get_mysql_connection():
    """Connect directly to the application database in MySQL."""
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=True,
        connect_timeout=3
    )

def init_mysql() -> Dict[str, Any]:
    """Ensure MySQL database and sample table exist."""
    try:
        # Step 1: Ensure database exists
        server_conn = get_mysql_server_connection()
        with server_conn.cursor() as cursor:
            cursor.execute(
                f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
            )
        server_conn.close()

        # Step 2: Ensure sample 'users' table exists
        conn = get_mysql_connection()
        with conn.cursor() as cursor:
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    role VARCHAR(50) DEFAULT 'User',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)
        conn.close()
        return {"success": True, "message": f"MySQL database '{MYSQL_DATABASE}' and 'users' table ready."}
    except Exception as e:
        return {"success": False, "error": str(e)}

def check_mysql_health() -> Dict[str, Any]:
    """Check connectivity to MySQL and return status dict."""
    try:
        conn = get_mysql_connection()
        with conn.cursor() as cursor:
            cursor.execute("SELECT 1 AS ok")
            result = cursor.fetchone()
        conn.close()
        return {
            "status": "connected",
            "database": MYSQL_DATABASE,
            "host": f"{MYSQL_HOST}:{MYSQL_PORT}",
            "error": None
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "database": MYSQL_DATABASE,
            "host": f"{MYSQL_HOST}:{MYSQL_PORT}",
            "error": str(e)
        }


# ============================================================================
# MongoDB Helper Functions
# ============================================================================

_mongo_client: Optional[MongoClient] = None

def get_mongo_client() -> MongoClient:
    """Return a singleton or shared MongoClient instance with connection pooling."""
    global _mongo_client
    if _mongo_client is None:
        _mongo_client = MongoClient(
            MONGO_URI,
            serverSelectionTimeoutMS=2000,
            connectTimeoutMS=2000
        )
    return _mongo_client

def get_mongo_db():
    """Return the MongoDB database instance."""
    client = get_mongo_client()
    return client[MONGO_DATABASE]

def init_mongodb() -> Dict[str, Any]:
    """Ensure MongoDB connection and create index on 'items' collection."""
    try:
        client = get_mongo_client()
        # Ping the server to check connectivity
        client.admin.command('ping')
        db = client[MONGO_DATABASE]
        # Create an index on 'name' in 'items' collection
        db.items.create_index("name")
        return {"success": True, "message": f"MongoDB database '{MONGO_DATABASE}' and 'items' collection ready."}
    except Exception as e:
        return {"success": False, "error": str(e)}

def check_mongo_health() -> Dict[str, Any]:
    """Check connectivity to MongoDB and return status dict."""
    try:
        client = get_mongo_client()
        client.admin.command('ping')
        return {
            "status": "connected",
            "database": MONGO_DATABASE,
            "uri": MONGO_URI,
            "error": None
        }
    except Exception as e:
        return {
            "status": "disconnected",
            "database": MONGO_DATABASE,
            "uri": MONGO_URI,
            "error": str(e)
        }
