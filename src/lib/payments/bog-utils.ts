export function maskBogEmail(email?: string | null) {
  if (!email) return undefined;
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return undefined;
  const visibleLength = Math.min(2, localPart.length);
  return `${localPart.slice(0, visibleLength)}${"*".repeat(Math.max(2, localPart.length - visibleLength))}@${domain}`;
}

export function maskBogPhone(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  if (normalized.length <= 4) return "*".repeat(normalized.length);
  return `${normalized.slice(0, -4)}****${normalized.slice(-2)}`;
}

export function createBogBuyer(customer: { name: string; phone: string; email?: string | null }) {
  const maskedEmail = maskBogEmail(customer.email);
  return {
    full_name: customer.name,
    masked_phone: maskBogPhone(customer.phone),
    ...(maskedEmail ? { masked_email: maskedEmail } : {}),
  };
}

export function toJsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
