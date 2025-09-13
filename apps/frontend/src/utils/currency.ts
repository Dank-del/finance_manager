export const currencySymbols = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  INR: '₹'
} as const;

export type Currency = keyof typeof currencySymbols;

export const formatCurrency = (amount: number, currency: Currency = 'USD'): string => {
  const symbol = currencySymbols[currency];
  return `${symbol}${amount.toFixed(2)}`;
};

export const getCurrencySymbol = (currency: Currency = 'USD'): string => {
  return currencySymbols[currency];
};