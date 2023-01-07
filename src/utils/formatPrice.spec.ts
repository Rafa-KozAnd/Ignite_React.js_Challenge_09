import { formatPrice } from "./formatPrice";

describe("formatPrice util", () => {
  it("should return price formatted correctly", () => {
    const formattedPrice = formatPrice(9.9);
    expect(formattedPrice).toBe("$9.90");
  });
});