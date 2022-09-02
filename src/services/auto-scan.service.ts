import { bot } from "../config";
import { Query } from "../interfaces/query.interface";
import { runQueryScan } from "../parsers/parser";
import { getTimeUntilDate } from "./query.service";

const timersMap = new Map<string, NodeJS.Timeout>();

export function updateTimeout(query: Query): void {
    if (timersMap.has(query.id)) {
        clearTimeout(timersMap.get(query.id));
    }
    
    const time = getTimeUntilDate(query.nextCheck);
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
