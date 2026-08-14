export const PLAYER_NAME_MIN_LENGTH = 1;
export const PLAYER_NAME_MAX_LENGTH = 24;

export function normalizePlayerName(
  input: string | undefined,
  minLength = PLAYER_NAME_MIN_LENGTH,
  authoredMaxLength = PLAYER_NAME_MAX_LENGTH,
): string {
  const normalized = input?.trim() ?? '';
  const maxLength = Math.min(authoredMaxLength, PLAYER_NAME_MAX_LENGTH);

  if (normalized.length < minLength || normalized.length > maxLength) {
    throw new Error(
      `Player name must contain ${minLength} to ${maxLength} characters.`,
    );
  }

  return normalized;
}
