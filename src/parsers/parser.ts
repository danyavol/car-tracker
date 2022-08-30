import { Parser } from "src/interfaces/parser.interface"
import { AvByParser } from "./av-by.parser";

export function isValidUrl(url: string): boolean {
    return getParser(url) !== null;
}

export function getParser(url: string): Parser | null {
    if (/^https?:\/\/cars.av.by\/filter/.test(url)) {
        return new AvByParser(url);
    }
    return null;
}