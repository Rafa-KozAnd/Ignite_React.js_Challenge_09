import { render, screen } from "@testing-library/react";
import { mocked } from "jest-mock";
import Home, { getStaticProps } from "../../pages";
import { stripe } from "../../services/stripe";

jest.mock("next/router");

jest.mock("next-auth/react", () => ({
  useSession: () => ({
    data: null,
    status: "unauthenticated",
  }),
}));

jest.mock("../../services/stripe");

describe("Home page", () => {
  it("should render correctly", () => {
    render(
      <Home product={{ id: "fake-product-id", priceFormatted: "$9.90" }} />,
    );

    expect(screen.getByText(/\$9.90/)).toBeInTheDocument();
  });

  it("should load initial data", async () => {
    const retrieveStripePricesMocked = mocked(stripe.prices.retrieve);

    retrieveStripePricesMocked.mockResolvedValueOnce({
      id: "fake-price-id",
      unit_amount: 990,
    } as any);

    const response = await getStaticProps({});

    expect(response).toEqual(
      expect.objectContaining({
        props: {
          product: {
            id: "fake-price-id",
            priceFormatted: "$9.90",
          },
        },
      }),
    );
  });
});