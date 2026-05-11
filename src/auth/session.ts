import { sha256 } from "@oslojs/crypto/sha2";
import { encodeBase32NoPadding, encodeHexLowerCase } from "@oslojs/encoding";
import { sql } from "bun";
import { cookies } from "next/headers";
import { cache } from "react";

const SESSION_COOKIE_NAME = "admin_session";
const DAY_IN_MS = 1000 * 60 * 60 * 24;

type CookieType = ReturnType<Awaited<ReturnType<typeof cookies>>["get"]>;

interface SessionCookieConfig {
	path: string;
	secure: boolean;
	httpOnly: boolean;
	sameSite: "lax" | "strict" | "none";
}

const COOKIE_CONFIG: SessionCookieConfig = {
	httpOnly: true,
	path: "/",
	secure: true,
	sameSite: "lax",
};

interface InsertedSession {
	userId: string;
	tokenHash: string;
	expiresAt: Date;
	twoFactorVerified: boolean;
}

export interface SessionData {
	sessionId: string;
	userId: string;
	expiresAt: Date;
	twoFactorVerified: boolean;
	email: string;
	emailVerified: boolean;
	hasTotp: boolean;
}

export function hashToken(token: string): string {
	const data = new TextEncoder().encode(token);
	const hash = sha256(data);
	return encodeHexLowerCase(hash);
}

export async function createSessionToken(): Promise<string> {
	const token = new Uint8Array(32);
	crypto.getRandomValues(token);
	return encodeBase32NoPadding(token);
}

export const getUserSession = cache(async (): Promise<SessionData | null> => {
	const cookieStore = await cookies();
	const token = cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null;

	if (token === null) {
		return null;
	}

	return await verifySession(hashToken(token));
});

export async function verifySession(
	tokenHash: string,
): Promise<SessionData | null> {
	const rows = await sql<SessionData[]>`
		SELECT
			admin_sessions.token_hash AS "sessionId",
			admin_sessions.user_id AS "userId",
			admin_sessions.expires_at AS "expiresAt",
			admin_sessions.two_factor_verified AS "twoFactorVerified",
			admins.email,
			admins.email_verified AS "emailVerified",
			(user_totp.user_id IS NOT NULL) AS "hasTotp"
		FROM admin_sessions
		INNER JOIN admins ON admin_sessions.user_id = admins.id
		LEFT JOIN admin_totp ON admin_sessions.id = admin_totp.user_id
		WHERE admin_sessions.token_hash = ${tokenHash}
	`;

	if (rows.length === 0) {
		return null;
	}

	if (Date.now() >= rows[0].expiresAt.getTime()) {
		await sql`DELETE FROM admin_sessions WHERE token_hash = ${tokenHash}`;
		return null;
	}

	if (Date.now() >= rows[0].expiresAt.getTime() - DAY_IN_MS * 15) {
		const newExpiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		rows[0].expiresAt = newExpiresAt;

		await sql`
          UPDATE admin_sessions
          SET expires_at = ${newExpiresAt.toISOString()}
          WHERE token_hash = ${tokenHash}
      `;
	}

	return {
		sessionId: rows[0].sessionId,
		userId: rows[0].userId,
		expiresAt: rows[0].expiresAt,
		twoFactorVerified: rows[0].twoFactorVerified,
		email: rows[0].email,
		emailVerified: rows[0].emailVerified,
		hasTotp: rows[0].hasTotp,
	};
}

export async function insertAdminSession(
	userId: string,
	tokenHash: string,
	expiresAt: Date,
	twoFactorVerified: boolean,
): Promise<InsertedSession> {
	const expiresAtString = expiresAt.toISOString();

	const result = await sql`
    INSERT INTO admin_sessions (user_id, token_hash, expires_at, two_factor_verified)
    VALUES (${userId}, ${tokenHash}, ${expiresAtString}, ${twoFactorVerified})
    RETURNING user_id, token_hash, expires_at, two_factor_verified
  `;

	const row = result[0];

	return {
		userId: row.user_id,
		tokenHash: row.token_hash,
		expiresAt: new Date(row.expires_at),
		twoFactorVerified: row.two_factor_verified,
	};
}

export async function verifySessionTwoFactor(
	tokenHash: string,
	userId: string,
): Promise<void> {
	await sql`
    UPDATE user_sessions
    SET two_factor_verified = true
    WHERE token_hash = ${tokenHash} AND user_id = ${userId}
  `;
}

export async function setSessionCookie(
	token: string,
	expiresAt: Date,
): Promise<void> {
	const cookieStore = await cookies();

	cookieStore.set(SESSION_COOKIE_NAME, token, {
		...COOKIE_CONFIG,
		expires: expiresAt,
	});
}

export async function getSessionCookie(): Promise<CookieType> {
	const cookieStore = await cookies();
	return cookieStore.get(SESSION_COOKIE_NAME);
}

export async function deleteAdminSession(tokenHash: string): Promise<void> {
	await sql`
    DELETE FROM admin_sessions
    WHERE token_hash = ${tokenHash}
  `;
}

export async function deleteSessionCookie(): Promise<void> {
	const cookieStore = await cookies();
	cookieStore.delete(SESSION_COOKIE_NAME);
}
