type NotificationInput = {
  to?: string;
  subject: string;
  message: string;
  channel?: "email" | "sms" | "admin";
};

export async function notify(input: NotificationInput) {
  console.info("notification", input);
  return { ok: true };
}
