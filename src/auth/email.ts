interface EmailAvailabilityResult {
	exists: boolean;
}

export async function checkEmailAvailability(email: string): Promise<boolean> {
	const result = await Bun.sql<EmailAvailabilityResult[]>`
    SELECT EXISTS (
      SELECT 1
      FROM users
      WHERE email = ${email}
    ) as exists
  `;

	return !result[0].exists;
}
