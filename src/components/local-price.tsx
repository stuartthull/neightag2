// LocalPrice.tsx
import React, { useState, useEffect } from 'react';
import { detectLocalCurrency, getExchangeRates } from './currency-service';

interface LocalPriceProps {
    basePriceGbp: number;
}

export const LocalPrice: React.FC<LocalPriceProps> = ({ basePriceGbp }) => {
    const [formattedPrice, setFormattedPrice] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        let isMounted = true;

        async function ConvertPrice() {
            // Run both requests in parallel for maximum speed
            const [targetCurrency, rates] = await Promise.all([
                detectLocalCurrency(),
                getExchangeRates()
            ]);

            if (!isMounted) return;

            const rate = rates[targetCurrency] || 1;
            const convertedAmount = basePriceGbp * rate;

            // Format based on user's browser language and detected currency
            const formatted = new Intl.NumberFormat(navigator.language, {
                style: 'currency',
                currency: targetCurrency,
            }).format(convertedAmount);

            setFormattedPrice(formatted);
            setLoading(false);
        }

        ConvertPrice();

        return () => {
            isMounted = false; // Clean up memory leaks on unmount
        };
    }, [basePriceGbp]);

    if (loading) {
        return <span className="price-loading">Calculating local price...</span>;
    }

    return <span className="local-price">{formattedPrice}</span>;
};