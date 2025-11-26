"""Check users in database."""

import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "crm_admin",
    "password": "crm_password_2025",
    "database": "ascendore_crm"
}

def check_users():
    """Check users in database."""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        print("=" * 60)
        print("USERS IN DATABASE")
        print("=" * 60)
        cursor.execute("""
            SELECT id, email, first_name, last_name, is_active,
                   password_hash IS NOT NULL as has_password
            FROM public.users
            ORDER BY created_at;
        """)

        users = cursor.fetchall()
        if not users:
            print("  No users found!")
        else:
            for row in users:
                print(f"\nID: {row[0]}")
                print(f"  Email: {row[1]}")
                print(f"  Name: {row[2]} {row[3]}")
                print(f"  Active: {row[4]}")
                print(f"  Has Password: {row[5]}")

        cursor.close()
        conn.close()

    except Exception as e:
        print(f"\n[ERROR] Failed to check users: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(check_users())
