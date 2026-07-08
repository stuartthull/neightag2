// currencyService.ts
export interface GeolocationData {
    currency: string;
    country_name: string;
}

export interface CachedRates {
    timestamp: number;
    rates: Record<string, number>;
}

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const BASE_CURRENCY = 'GBP';

// 1. Detect the user's local currency via IP geolocation
export async function detectLocalCurrency(): Promise<string> {
    try {
        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) throw new Error('Failed to fetch location');
        const data: GeolocationData = await response.json();
        return data.currency || BASE_CURRENCY;
    } catch (error) {
        console.error('Geolocation failed, falling back to GBP:', error);
        return BASE_CURRENCY;
    }
}

// 2. Fetch and cache conversion rates
export async function getExchangeRates(): Promise<Record<string, number>> {
    const cachedData = localStorage.getItem('exchange_rates');

    if (cachedData) {
        const parsedCache: CachedRates = JSON.parse(cachedData);
        const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;

        if (!isExpired) {
            return parsedCache.rates; // Return cached rates if valid
        }
    }

    // Fetch new rates if cache is missing or expired
    try {
        const response = await fetch(`https://open.er-api.com/v6/latest/${BASE_CURRENCY}`);
        if (!response.ok) throw new Error('Failed to fetch exchange rates');

        const data = await response.json();
        const rates: Record<string, number> = data.rates;

        const cachePayload: CachedRates = {
            timestamp: Date.now(),
            rates,
        };

        localStorage.setItem('exchange_rates', JSON.stringify(cachePayload));
        return rates;
    } catch (error) {
        console.error('Failed to fetch live rates, using fallback:', error);
        return { [BASE_CURRENCY]: 1 };
    }
}