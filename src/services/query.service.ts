import { CheckFrequency } from "../interfaces/check-frequency.interface";

export function getCheckFrequencyName(checkFrequency: CheckFrequency): string {
    switch(checkFrequency) {
        case CheckFrequency.Never: return "Никогда";
        case CheckFrequency.Hour1: return "Каждый час";
        case CheckFrequency.Hour6: return "Каждые 6 часов";
        case CheckFrequency.Day1: return "Раз в день";
        case CheckFrequency.Day3: return "Раз в 3 дня";
        case CheckFrequency.Day7: return "Раз в неделю";
        default: return "";
    }
}

export function getNextCheckDate(frequency: CheckFrequency): Date | null {
    const date = new Date();

    switch (frequency) {
        case CheckFrequency.Never: return null;
        case CheckFrequency.Hour1: 
            date.setHours(date.getHours() + 1);
            break;
        case CheckFrequency.Hour6:
            date.setHours(date.getHours() + 6);
            break;
        case CheckFrequency.Day1:
            date.setDate(date.getDate() + 1);
            break;
        case CheckFrequency.Day3:
            date.setDate(date.getDate() + 3);
            break;
        case CheckFrequency.Day7:
            date.setDate(date.getDate() + 7);
            break;
    }
    return date;
}

export function getTimeUntilStart(startDate: Date | null): number | null {
    if (!startDate) return null;
    const now = new Date();
    return startDate.getTime() - now.getTime();
}