/**
 * currencyConfig.ts
 *
 * Currency configuration for multi-language support
 * Exchange rates and formatting for USD/THB
 */

export type CurrencyCode = 'USD' | 'THB';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  position: 'before' | 'after';
  locale: string;
  exchangeRateToUSD: number;
}

export const CURRENCY_CONFIGS: Record<CurrencyCode, CurrencyConfig> = {
  USD: {
    code: 'USD',
    symbol: '$',
    position: 'before',
    locale: 'en-US',
    exchangeRateToUSD: 1,
  },
  THB: {
    code: 'THB',
    symbol: '฿',
    position: 'before',
    locale: 'th-TH',
    exchangeRateToUSD: 35, // Approximate rate: 1 USD ≈ 35 THB
  },
};

export function getCurrencyConfig(code: CurrencyCode): CurrencyConfig {
  return CURRENCY_CONFIGS[code] || CURRENCY_CONFIGS.USD;
}

export function formatCurrency(amount: number, currency: CurrencyCode = 'USD'): string {
  const config = getCurrencyConfig(currency);
  const formatted = new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatted;
}

export function convertUSDToLocal(usdAmount: number, currency: CurrencyCode): number {
  const config = getCurrencyConfig(currency);
  return usdAmount * config.exchangeRateToUSD;
}

export default CURRENCY_CONFIGS;
