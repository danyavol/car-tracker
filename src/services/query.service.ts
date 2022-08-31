import { CheckFrequency } from "src/interfaces/check-frequency.interface";
import { Query } from "src/interfaces/query.interface";
import { escapeReservedSymbols } from "./escape.service";

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

export function getQueryName(query: Query): string {
    return `[${escapeReservedSymbols(query.name)}](${query.link})`;
}