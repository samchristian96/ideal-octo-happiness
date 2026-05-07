import {
	createJWTSignatureMessage,
	encodeJWT,
	joseAlgorithmHS256,
} from "@oslojs/jwt";

interface TokenHeader {
	alg: typeof joseAlgorithmHS256;
	typ: "JWT";
}

interface TokenPayload {
	sub: string;
	exp: number;
	iat: number;
}

async function createMyToken(): Promise<string> {
	const header: TokenHeader = {
		alg: joseAlgorithmHS256,
		typ: "JWT",
	};

	const payload: TokenPayload = {
		sub: "user_123",
		exp: Math.floor(Date.now() / 1000) + 3600,
		iat: Math.floor(Date.now() / 1000),
	};

	const signatureMessage = createJWTSignatureMessage(header, payload);

	const secret = "your-super-secret-256-bit-key-here";
	const encoder = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		encoder.encode(secret),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const signatureMessageBytes = encoder.encode(signatureMessage);

	const signatureBuffer = await crypto.subtle.sign(
		"HMAC",
		cryptoKey,
		signatureMessageBytes,
	);

	const signature = new Uint8Array(signatureBuffer);

	const token = encodeJWT(header, payload, signature);

	return token;
}

createMyToken().then((token) => console.log(token));
