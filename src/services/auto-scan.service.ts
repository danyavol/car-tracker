import { bot } from "../config";
import { Query } from "../interfaces/query.interface";
import { runQueryScan } from "../parsers/parser";
import { getTimeUntilDate } from "./query.service";
import { timersMap } from "./storage.service";

export function updateTimeout(query: Query): void {
    if (timersMap.has(query.id)) {
        clearTimeout(timersMap.get(query.id));
    }
    
    const time = getTimeUntilDate(query.nextScan);
    if (time === null) return;

    const newTimeout = setTimeout(() => {
        if (query.checkInProcess) return;
        runQueryScan(query).subscribe((notices) => {
            notices.forEach(notice => {
                bot.telegram.sendPhoto(query.userId, notice.photo, {
                    caption: notice.message,
                    parse_mode: "MarkdownV2"
                });
            });
        });
    }, time);

    timersMap.set(query.id, newTimeout);
}

export function deleteTimeout(queryId: string): void {
    const timeoutId = timersMap.get(queryId);
    if (timeoutId) {
        clearTimeout(timeoutId);
        timersMap.delete(queryId);
    }
}
