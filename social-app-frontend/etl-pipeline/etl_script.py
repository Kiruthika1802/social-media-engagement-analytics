import pymongo
import psycopg2

# =================================================================
# === YOUR CREDENTIALS (PRE-FILLED) ===
# =================================================================
MONGO_URI = "mongodb+srv://kiruthikaintj_db_user:kiruthika18@cluster0.qqeklhz.mongodb.net/"
NEON_HOST = "ep-weathered-band-adbv8qjn-pooler.c-2.us-east-1.aws.neon.tech"
NEON_DATABASE = "neondb"
NEON_USER = "neondb_owner"
NEON_PASSWORD = "npg_40eDtrhWTqfB"
# =================================================================

def run_etl():
    print("--- Starting ETL Process ---")

    # 1. EXTRACT data from MongoDB
    try:
        print("Connecting to MongoDB...")
        mongo_client = pymongo.MongoClient(MONGO_URI)
        
        # --- FIXED: Changed "myFirstDatabase" to "test" ---
        db = mongo_client["test"] 
        
        posts_collection = db["posts"]
        
        posts_data = list(posts_collection.find({}))
        print(f"✅ Successfully extracted {len(posts_data)} records from MongoDB.")
        
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        return

    # 2. TRANSFORM data
    print("Transforming data...")
    analytics_data = []
    for post in posts_data:
        transformed_post = (
            str(post.get('_id')),
            post.get('text', ''),
            post.get('imageUrl', ''),
            post.get('likes', 0)
        )
        analytics_data.append(transformed_post)
    print("✅ Data transformed successfully.")

    # 3. LOAD data into Neon (PostgreSQL)
    try:
        print("Connecting to Neon (PostgreSQL)...")
        conn = psycopg2.connect(
            host=NEON_HOST,
            database=NEON_DATABASE,
            user=NEON_USER,
            password=NEON_PASSWORD
        )
        cur = conn.cursor()

        cur.execute("""
            CREATE TABLE IF NOT EXISTS engagement_analytics (
                post_id VARCHAR(255) PRIMARY KEY,
                post_content TEXT,
                image_url VARCHAR(1024),
                like_count INTEGER
            );
        """)
        
        cur.execute("TRUNCATE TABLE engagement_analytics;")
        for post in analytics_data:
            cur.execute(
                "INSERT INTO engagement_analytics (post_id, post_content, image_url, like_count) VALUES (%s, %s, %s, %s)",
                post
            )
        
        conn.commit()
        cur.close()
        conn.close()
        print(f"✅ Successfully loaded {len(analytics_data)} records into Neon.")
        print("\n✅🎉 Project pipeline is complete!")

    except Exception as e:
        print(f"❌ Error connecting to or loading data into Neon: {e}")
        return

if __name__ == "__main__":
    run_etl()