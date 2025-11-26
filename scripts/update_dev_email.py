"""Update dev user email to ascendore.ai domain."""

import psycopg2

DB_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "crm_admin",
    "password": "crm_password_2025",
    "database": "ascendore_crm"
}

OLD_EMAIL = "dev@ascendore.local"
NEW_EMAIL = "dev@ascendore.ai"

def update_dev_email():
    """Update dev user email."""
    print("=" * 60)
    print("Updating Dev User Email")
    print("=" * 60)
    print(f"\nOld Email: {OLD_EMAIL}")
    print(f"New Email: {NEW_EMAIL}")
    print()

    try:
        conn = psycopg2.connect(**DB_CONFIG)
        cursor = conn.cursor()

        # Update the user's email
        print(f"Updating email from {OLD_EMAIL} to {NEW_EMAIL}...")
        cursor.execute(
            """
            UPDATE public.users
            SET email = %s, updated_at = NOW()
            WHERE email = %s
            RETURNING id, email, first_name, last_name;
            """,
            (NEW_EMAIL, OLD_EMAIL)
        )

        result = cursor.fetchone()

        if result:
            user_id, email, first_name, last_name = result
            print(f"[OK] Email updated for user:")
            print(f"    ID: {user_id}")
            print(f"    Name: {first_name} {last_name}")
            print(f"    Email: {email}")
        else:
            print(f"[ERROR] User not found: {OLD_EMAIL}")
            return 1

        conn.commit()
        cursor.close()
        conn.close()

        print("\n" + "=" * 60)
        print("Dev User Email Updated Successfully!")
        print("=" * 60)
        print("\nYou can now login with:")
        print(f"  Email: {NEW_EMAIL}")
        print(f"  Password: DevPassword123!")
        print()

    except Exception as e:
        print(f"\n[ERROR] Failed to update email: {e}")
        import traceback
        traceback.print_exc()
        return 1

    return 0

if __name__ == "__main__":
    exit(update_dev_email())
