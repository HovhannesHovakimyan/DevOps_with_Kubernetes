from flask import Flask, jsonify
import psycopg2
from psycopg2 import sql
import os
import time
import sys

app = Flask(__name__)

# Database configuration
DB_HOST = os.getenv("DB_HOST", "postgres-service.devops.svc.cluster.local")
DB_NAME = os.getenv("DB_NAME", "pingpong")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "postgres")
DB_PORT = os.getenv("DB_PORT", "5432")


def log_error(message):
    """Print error to stderr with timestamp"""
    timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
    print(f"[ERROR][{timestamp}] {message}", file=sys.stderr)


def init_db():
    max_retries = 5
    retry_delay = 5

    for attempt in range(max_retries):
        try:
            conn = psycopg2.connect(
                host=DB_HOST,
                database=DB_NAME,
                user=DB_USER,
                password=DB_PASSWORD,
                port=DB_PORT,
            )
            log_error(
                f"Successfully connected to DB: {DB_USER}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
            )

            with conn.cursor() as cur:
                cur.execute(
                    """
                    CREATE TABLE IF NOT EXISTS request_counter (
                        id SERIAL PRIMARY KEY,
                        count INTEGER NOT NULL DEFAULT 0
                    );
                    INSERT INTO request_counter (count)
                    SELECT 0 WHERE NOT EXISTS (SELECT 1 FROM request_counter);
                """
                )
                conn.commit()
            return conn

        except psycopg2.OperationalError as e:
            log_error(
                f"Connection attempt {attempt + 1}/{max_retries} failed to {DB_HOST}:{DB_PORT} - {str(e)}"
            )
            if attempt == max_retries - 1:
                log_error("FATAL: All database connection attempts failed")
                raise
            time.sleep(retry_delay)


def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT,
        )
        return conn
    except psycopg2.Error as e:
        log_error(f"Database connection failed: {str(e)}")
        log_error(
            f"Connection details: postgresql://{DB_USER}:******@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        )
        raise


# Initialize database connection
try:
    db_conn = init_db()
except Exception as e:
    log_error(f"Startup failed: {str(e)}")
    sys.exit(1)


@app.route("/ping", methods=["GET"])
def ping():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    UPDATE request_counter
                    SET count = count + 1
                    WHERE id = 1
                    RETURNING count;
                """
                )
                count = cur.fetchone()[0]
                conn.commit()
                return f"pong {count}"
    except Exception as e:
        log_error(f"/ping failed: {str(e)}")
        return "Database error", 500


@app.route("/pongs", methods=["GET"])
def get_pongs():
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT count FROM request_counter WHERE id = 1;")
                count = cur.fetchone()[0]
                return jsonify({"pongs": count})
    except Exception as e:
        log_error(f"/pongs failed: {str(e)}")
        return "Database error", 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001)
