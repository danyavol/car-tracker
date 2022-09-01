export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);
}

export function formatMileage(mileage: number): string {
    return new Intl.NumberFormat().format(mileage) + ' км';
}

export function formatYear(year: number): string {
    return year + ' г';
}