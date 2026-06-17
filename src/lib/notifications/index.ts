import { env } from "@/lib/env";

type NotificationField = {
  name: string;
  value?: string | number | boolean | null;
  inline?: boolean;
};

type NotificationInput = {
  to?: string;
  subject: string;
  message: string;
  channel?: "email" | "sms" | "admin" | "discord";
  fields?: NotificationField[];
  url?: string;
  color?: number;
};

type DiscordEmbedField = {
  name: string;
  value: string;
  inline?: boolean;
};

const DISCORD_LIMITS = {
  title: 256,
  description: 4096,
  fieldName: 256,
  fieldValue: 1024,
};

function truncate(value: string, limit: number) {
  if (value.length <= limit) return value;
  return `${value.slice(0, Math.max(0, limit - 1))}…`;
}

function formatFieldValue(value: NotificationField["value"]) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value === "boolean") return value ? "კი" : "არა";
  return String(value);
}

export async function notify(input: NotificationInput) {
  console.info("notification", input);

  if (!env.DISCORD_WEBHOOK_URL) {
    return { ok: true, skipped: true };
  }

  const fields = input.fields?.reduce<DiscordEmbedField[]>((acc, field) => {
    const value = formatFieldValue(field.value);
    if (!value) return acc;
    acc.push({
      name: truncate(field.name, DISCORD_LIMITS.fieldName),
      value: truncate(value, DISCORD_LIMITS.fieldValue),
      inline: field.inline,
    });
    return acc;
  }, []);

  try {
    const response = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        username: "Gagrileba.ge",
        embeds: [
          {
            title: truncate(input.subject, DISCORD_LIMITS.title),
            description: truncate(input.message, DISCORD_LIMITS.description),
            color: input.color ?? 0x0ea5e9,
            url: input.url,
            fields,
            timestamp: new Date().toISOString(),
          },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Discord notification failed", { status: response.status, error });
      return { ok: false, error };
    }

    return { ok: true };
  } catch (error) {
    console.error("Discord notification failed", error);
    return { ok: false, error };
  }
}
