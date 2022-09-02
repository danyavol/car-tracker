export function formatPrice(price: number): string {
    return new Intl.NumberFormat('ru', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

export function formatMileage(mileage: number): string {
    return new Intl.NumberFormat('ru').format(mileage) + ' км';
}

export function formatYear(year: number): string {
    return year + ' г';
}