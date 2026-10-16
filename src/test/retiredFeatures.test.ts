import { describe, it, expect } from "vitest";
import { FEATURE_AVAILABILITY } from "@/config/retiredFeatures";

describe("owner-requested option retirement", () => {
  it("disables the prestataire directory", () => expect(FEATURE_AVAILABILITY.prestataires).toBe(false));
  it("disables Faso Yaar", () => expect(FEATURE_AVAILABILITY.fasoYaar).toBe(false));
  it("disables the cart", () => expect(FEATURE_AVAILABILITY.panier).toBe(false));
});
