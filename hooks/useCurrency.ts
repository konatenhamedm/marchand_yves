'use client';

import { useMagasin } from '@/context/MagasinContext';
import { useCallback } from 'react';

export function useCurrency() {
    const { devise } = useMagasin();
    
    const formatAmount = useCallback((amount: number | string | null | undefined) => {
        if (amount === null || amount === undefined) return '-';
        
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        
        if (isNaN(numericAmount)) return '-';

        const symbole = devise?.code || devise?.symbole || '';
        const nbDecimal = devise?.nb_decimal ?? 0;

        const formatted = new Intl.NumberFormat('fr-FR', {
            minimumFractionDigits: nbDecimal,
            maximumFractionDigits: nbDecimal,
        }).format(numericAmount);

        return symbole ? `${formatted} ${symbole}` : formatted;
    }, [devise]);

    return {
        formatAmount,
        currencySymbol: devise?.code || devise?.symbole || '',
        nbDecimal: devise?.nb_decimal ?? 0,
    };
}
