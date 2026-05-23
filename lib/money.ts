type MoneyLike = number | string | { toString(): string };

type PartCostItem = {
  quantity: number;
  unitPrice: MoneyLike;
};

export function getCurrency() {
  return process.env.CURRENCY || "USD";
}

export function toNumber(value: MoneyLike | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  return Number(value);
}

export function calculatePartsTotal(parts: PartCostItem[]) {
  return parts.reduce((total, part) => {
    return total + toNumber(part.unitPrice) * part.quantity;
  }, 0);
}

export function formatCurrency(
  value: MoneyLike | null | undefined,
  currency = getCurrency()
) {
  if (currency === "UZS") {
    return `${Math.round(toNumber(value)).toLocaleString("en-US").replace(/,/g, " ")} UZS`;
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(toNumber(value));
}
