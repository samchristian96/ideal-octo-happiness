import {
	deleteCookie,
	getCookie,
	setCookie,
} from "@tanstack/react-start/server";
import { cache } from "react";
import { hashToken } from "~/auth/utils";

const SESSION_COOKIE_NAME = "admin_session";
const DAY_IN_MS = 1000 * 60 * 60 * 24;

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
	adminId: string;
	tokenHash: string;
	expiresAt: Date;
	twoFactorVerified: boolean;
}

export interface SessionData {
	sessionId: string;
	adminId: string;
	expiresAt: Date;
	twoFactorVerified: boolean;
	email: string;
	emailVerified: boolean;
	hasTotp: boolean;
}

export const getAdminSession = cache(async (): Promise<SessionData | null> => {
	const token = getCookie(SESSION_COOKIE_NAME) ?? null;

	if (token === null) {
		return null;
	}

	return await verifySession(hashToken(token));
});

export async function verifySession(
	tokenHash: string,
): Promise<SessionData | null> {
	const rows = await Bun.sql<SessionData[]>`
    SELECT
      admin_sessions.token_hash AS "sessionId",
      admin_sessions.admin_id AS "adminId",
      admin_sessions.expires_at AS "expiresAt",
      admin_sessions.two_factor_verified AS "twoFactorVerified",
      admins.email,
      admins.email_verified AS "emailVerified",
      (admin_totp.admin_id IS NOT NULL) AS "hasTotp"
    FROM admin_sessions
    INNER JOIN admins ON admin_sessions.admin_id = admins.id
    LEFT JOIN admin_totp ON admin_sessions.id = admin_totp.admin_id
    WHERE admin_sessions.token_hash = ${tokenHash}
  `;

	if (rows.length === 0) {
		return null;
	}

	if (Date.now() >= rows[0].expiresAt.getTime()) {
		await Bun.sql`DELETE FROM admin_sessions WHERE token_hash = ${tokenHash}`;
		return null;
	}

	if (Date.now() >= rows[0].expiresAt.getTime() - DAY_IN_MS * 15) {
		const newExpiresAt = new Date(Date.now() + DAY_IN_MS * 30);
		rows[0].expiresAt = newExpiresAt;

		await Bun.sql`
          UPDATE admin_sessions
          SET expires_at = ${newExpiresAt.toISOString()}
          WHERE token_hash = ${tokenHash}
      `;
	}

	return {
		sessionId: rows[0].sessionId,
		adminId: rows[0].adminId,
		expiresAt: rows[0].expiresAt,
		twoFactorVerified: rows[0].twoFactorVerified,
		email: rows[0].email,
		emailVerified: rows[0].emailVerified,
		hasTotp: rows[0].hasTotp,
	};
}

export async function insertAdminSession(
	adminId: string,
	tokenHash: string,
	expiresAt: Date,
	twoFactorVerified: boolean,
): Promise<InsertedSession> {
	const expiresAtString = expiresAt.toISOString();

	const result = await Bun.sql`
    INSERT INTO admin_sessions (admin_id, token_hash, expires_at, two_factor_verified)
    VALUES (${adminId}, ${tokenHash}, ${expiresAtString}, ${twoFactorVerified})
    RETURNING admin_id, token_hash, expires_at, two_factor_verified
  `;

	const row = result[0];

	return {
		adminId: row.admin_id,
		tokenHash: row.token_hash,
		expiresAt: new Date(row.expires_at),
		twoFactorVerified: row.two_factor_verified,
	};
}

export async function verifySessionTwoFactor(
	tokenHash: string,
	adminId: string,
): Promise<void> {
	await Bun.sql`
    UPDATE admin_sessions
    SET two_factor_verified = true
    WHERE token_hash = ${tokenHash} AND admin_id = ${adminId}
  `;
}

export function setSessionCookie(token: string, expiresAt: Date): void {
	setCookie(SESSION_COOKIE_NAME, token, {
		...COOKIE_CONFIG,
		expires: expiresAt,
	});
}

export function getSessionCookie(): string | undefined {
	return getCookie(SESSION_COOKIE_NAME);
}

export async function deleteAdminSession(tokenHash: string): Promise<void> {
	await Bun.sql`
    DELETE FROM admin_sessions
    WHERE token_hash = ${tokenHash}
  `;
}

export function deleteSessionCookie(): void {
	deleteCookie(SESSION_COOKIE_NAME);
}
