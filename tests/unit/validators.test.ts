import { describe, expect, it } from "vitest";
import { leadSchema } from "../../src/lib/validators/leads";
import { checkoutSchema } from "../../src/lib/validators/orders";
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
