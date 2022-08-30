import { CheckFrequency } from "src/interfaces/check-frequency.interface";
import { Query } from "src/interfaces/query.interface";

export function getCheckFrequencyName(query: Query): string {
    switch(query.checkFrequency) {
        case CheckFrequency.Hour1: return "Каждый час";
        case CheckFrequency.Hour6: return "Каждые 6 часов";
        case CheckFrequency.Day1: return "Раз в день";
        case CheckFrequency.Day3: return "Раз в 3 дня";
        case CheckFrequency.Day7: return "Раз в неделю";
        default: return "";
    }
}