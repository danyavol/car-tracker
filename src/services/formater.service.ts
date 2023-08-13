import { Currency } from "src/interfaces/currency.interface";

export function formatPrice(price: number, currency: Currency): string {
    return new Intl.NumberFormat('ru', { style: 'currency', currency, maximumFractionDigits: 0 }).format(price);
}

export function formatMileage(mileage: number): string {
    return new Intl.NumberFormat('ru').format(mileage) + ' км';
}

export function formatYear(year: number): string {
    return year + ' г';
}