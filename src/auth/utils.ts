import { sha256 } from "@oslojs/crypto/sha2";
import {
	encodeBase32NoPadding,
	encodeBase32UpperCaseNoPadding,
	encodeHexLowerCase,
} from "@oslojs/encoding";

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

export function createOTP(): string {
	return encodeBase32UpperCaseNoPadding(
		crypto.getRandomValues(new Uint8Array(5)),
	);
}

export function createRecoveryCode(): string {
	return encodeBase32UpperCaseNoPadding(
		crypto.getRandomValues(new Uint8Array(10)),
	);
}
