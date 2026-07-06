import { describe, it, expect } from 'vitest';

/**
 * Utility formater that we extracted to test
 */
export const formatMoney = (amount: number | string | undefined | null) => {
    if (amount === undefined || amount === null) return "0 F";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(num) ? "0 F" : new Intl.NumberFormat("fr-FR").format(num) + " F";
};

describe('Formatter Utilities', () => {
    it('formats positive numbers correctly', () => {
        expect(formatMoney(1500)).toBe('1\u202F500 F');
        expect(formatMoney(1000000)).toBe('1\u202F000\u202F000 F');
    });

    it('handles strings that contain numbers', () => {
        expect(formatMoney("2500.50")).toBe('2\u202F500,5 F');
    });

    it('handles 0 correctly', () => {
        expect(formatMoney(0)).toBe('0 F');
    });

    it('handles null or undefined safely', () => {
        expect(formatMoney(null)).toBe('0 F');
        expect(formatMoney(undefined)).toBe('0 F');
    });

    it('handles invalid strings securely', () => {
        expect(formatMoney("abc")).toBe('0 F');
    });
});
