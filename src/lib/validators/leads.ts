import { z } from "zod";

export const leadSchema = z.object({
  name: z.string().min(2, "სახელი აუცილებელია"),
  phone: z.string().min(6, "ტელეფონი აუცილებელია"),
  email: z.string().email().optional().or(z.literal("")),
  source: z.string().default("contact"),
  productInterest: z.string().optional(),
  roomSize: z.string().optional(),
  budget: z.string().optional(),
  urgency: z.string().optional(),
  installationNeeded: z.coerce.boolean().optional(),
  message: z.string().optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;
