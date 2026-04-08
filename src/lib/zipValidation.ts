const SAME_DIGIT_ZIPS = new Set([
  '00000', '11111', '22222', '33333', '44444',
  '55555', '66666', '77777', '88888', '99999',
]);

const FAKE_ZIPS = new Set(['12345']);

const INVALID_MSG = 'Please enter a valid US zip code';

export function validateZip(zip: string): string | null {
  if (!/^\d{5}$/.test(zip)) return INVALID_MSG;
  if (SAME_DIGIT_ZIPS.has(zip)) return INVALID_MSG;
  if (FAKE_ZIPS.has(zip)) return INVALID_MSG;
  if (zip.startsWith('00') && !(zip >= '00600' && zip <= '00999')) return INVALID_MSG;
  return null;
}
