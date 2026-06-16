import { z } from "zod";

export const installmentMonths = [3, 6, 9, 12, 18, 24, 36] as const;

export const checkoutSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  city: z.string().min(2),
  district: z.string().optional(),
  address: z.string().min(4),
  deliveryPreference: z.string().optional(),
  installationRequired: z.coerce.boolean().default(false),
  preferredInstallationDate: z.string().optional(),
  paymentMethod: z.enum(["card", "installment", "bank_transfer", "pay_on_delivery"]),
  installmentMonth: z.coerce.number().refine((month) => installmentMonths.includes(month as (typeof installmentMonths)[number])).optional(),
  notes: z.string().optional(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive(),
    installationIncluded: z.boolean().default(false),
  })).min(1),
}).superRefine((data, context) => {
  if (data.paymentMethod === "installment" && !data.installmentMonth) {
    context.addIssue({
      code: "custom",
      path: ["installmentMonth"],
      message: "Installment month is required for installment payments.",
    });
  }
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
