import { formatUpdatedAt } from "./formatUpdatedAt";

describe("formatUpdatedAt util", () => {
  it("should return updated at formatted correctly", () => {
    const formattedUpdatedAt = formatUpdatedAt(new Date("06-30-2022"));
    expect(formattedUpdatedAt).toBe("30 de junho de 2022");
  });
});