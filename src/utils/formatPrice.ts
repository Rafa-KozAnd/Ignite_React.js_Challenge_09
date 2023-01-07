export function formatPrice(price: number, currency = "usd") {
    const formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  
    return formatter.format(price);
  }