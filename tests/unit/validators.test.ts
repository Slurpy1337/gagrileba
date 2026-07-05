import { describe, expect, it } from "vitest";
import { leadSchema } from "../../src/lib/validators/leads";
import { checkoutSchema } from "../../src/lib/validators/orders";
import { createBogBuyer, maskBogEmail, maskBogPhone, toJsonSafe } from "../../src/lib/payments/bog-utils";
import { slugify } from "../../src/lib/utils";

describe("validators", () => {
  it("accepts a valid lead", () => {
    expect(leadSchema.safeParse({ name: "ნიკა", phone: "+995555111222", source: "test" }).success).toBe(true);
  });

  it("rejects checkout without items", () => {
    expect(checkoutSchema.safeParse({ customerName: "N", phone: "123456", city: "თბილისი", address: "A", paymentMethod: "card", items: [] }).success).toBe(false);
  });

  it("slugifies Georgian text", () => {
    expect(slugify("კონდიციონერი Midea AF-12")).toBe("konditsioneri-midea-af-12");
  });
});

describe("BOG buyer privacy fields", () => {
  it("masks customer contact details required by the BOG API", () => {
    expect(maskBogEmail("customer@example.com")).toBe("cu******@example.com");
    expect(maskBogPhone("+995 555 12 34 56")).toBe("+99555512****56");
  });

  it("omits absent optional values from Prisma JSON payloads", () => {
    const buyer = createBogBuyer({ name: "Customer", phone: "555123456", email: null });
    expect(buyer).not.toHaveProperty("masked_email");
    expect(toJsonSafe({ buyer, optional: undefined })).toEqual({ buyer });
  });
});
