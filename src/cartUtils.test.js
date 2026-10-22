import { describe, it, expect } from "vitest";
import { calculateTotalPrice } from "./CartUtils";

describe("calculateTotalPrice", () => {
  it("should calculate the total cart price correctly", () => {
    const cartItems = [
      { price: 100, qty: 2 },
      { price: 50, qty: 1 },
    ];

    expect(calculateTotalPrice(cartItems)).toBe(250);
  });
});