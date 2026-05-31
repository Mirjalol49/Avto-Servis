const rawUzbekPhoneRegex = /^998\d{9}$/;
const localUzbekPhoneRegex = /^\d{9}$/;

export function normalizeAuthPhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (rawUzbekPhoneRegex.test(digits)) {
    return digits;
  }

  if (localUzbekPhoneRegex.test(digits)) {
    return `998${digits}`;
  }

  return null;
}
