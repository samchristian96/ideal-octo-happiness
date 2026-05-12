import { hashPassword } from "~/auth/password";

/**
 * Resets the admin-related tables and seeds a primary admin user.
 * Ensure the uuid-ossp extension is available for uuid_generate_v7()
 * if your Postgres version requires it.
 */
export async function seedDatabase() {
	// 1. Reset: Drop existing tables and functions to ensure a clean state
	console.log("Wiping database schema...");

	// 1. Nuke the entire public schema (cascades everything inside it)
	await Bun.sql`DROP SCHEMA public CASCADE`;

	// 2. Recreate a fresh, empty public schema
	await Bun.sql`CREATE SCHEMA public`;

	// 3. Restore default permissions so your app can interact with it
	await Bun.sql`GRANT ALL ON SCHEMA public TO public`;

	// 2. Schema Creation
	await Bun.sql`
    CREATE TABLE admins (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(254) NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      email_verified BOOLEAN DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

	await Bun.sql`
    CREATE TABLE admin_sessions (
      token_hash TEXT PRIMARY KEY,
      admin_id UUID NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      expires_at TIMESTAMPTZ NOT NULL,
      two_factor_verified BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

	// 3. Trigger for updated_at
	await Bun.sql`
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `;

	await Bun.sql`
    CREATE TRIGGER set_updated_at
      BEFORE UPDATE ON admins
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  `;

	// 4. Seed Admin User
	const adminEmail = "admin@example.com";
	const hashedPassword = await hashPassword("your-secure-password");

	await Bun.sql`
    INSERT INTO admins (email, password_hash, email_verified)
    VALUES (${adminEmail}, ${hashedPassword}, TRUE)
  `;

	console.log("Database reset and admin user seeded successfully.");
}

seedDatabase();
