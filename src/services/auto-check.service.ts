import { bot } from "src/config";
import { Query } from "src/interfaces/query.interface";
import { parseAndSaveCar } from "src/parsers/parser";
import { getNextCheckDate, getTimeUntilStart } from "./query.service";

const timersMap = new Map<string, NodeJS.Timeout>();

export function updateTimeout(query: Query): void {
    query = { ...query };
    if (timersMap.has(query.id)) {
        clearTimeout(timersMap.get(query.id));
    }
    
    const time = getTimeUntilStart(query.nextCheck);
    if (time === null) return;

    const newTimeout = setTimeout(() => {
        query.nextCheck = getNextCheckDate(query.checkFrequency);
        
        parseAndSaveCar(query).subscribe((notices) => {
            notices.forEach(notice => {
                bot.telegram.sendPhoto(query.userId, notice.photo, {
                    caption: notice.message,
                    parse_mode: "MarkdownV2"
                });
            });
            updateTimeout(query);
        });
    }, time);

    timersMap.set(query.id, newTimeout);
}

