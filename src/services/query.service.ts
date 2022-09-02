import { ScanFrequency } from "../interfaces/scan-frequency.interface";

export function getScanFrequencyName(frequency: ScanFrequency): string {
    switch(frequency) {
        case ScanFrequency.Never: return "Никогда";
        case ScanFrequency.Hour1: return "Каждый час";
        case ScanFrequency.Hour6: return "Каждые 6 часов";
        case ScanFrequency.Day1: return "Раз в день";
        case ScanFrequency.Day3: return "Раз в 3 дня";
        case ScanFrequency.Day7: return "Раз в неделю";
        default: return "";
    }
}

export function getNextScanDate(frequency: ScanFrequency): Date | null {
    const date = new Date();

    switch (frequency) {
        case ScanFrequency.Never: return null;
        case ScanFrequency.Hour1: 
            date.setHours(date.getHours() + 1);
            break;
        case ScanFrequency.Hour6:
            date.setHours(date.getHours() + 6);
            break;
        case ScanFrequency.Day1:
            date.setDate(date.getDate() + 1);
            break;
        case ScanFrequency.Day3:
            date.setDate(date.getDate() + 3);
            break;
        case ScanFrequency.Day7:
            date.setDate(date.getDate() + 7);
            break;
    }
    return date;
}

export function getTimeUntilDate(startDate: Date | null): number | null {
    if (!startDate) return null;
    const now = new Date();
    return startDate.getTime() - now.getTime();
}