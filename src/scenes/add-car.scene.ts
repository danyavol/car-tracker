import { db } from "../database/database";
import { ScanFrequency } from "../interfaces/scan-frequency.interface";
import { Query } from "../interfaces/query.interface";
import { getMainMenuKeyboard } from "../keyboards/keyboards";
import { isValidUrl } from "../parsers/parser";
import { allQueries } from "../services/storage.service";
import { Scenes } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import uuid from "short-uuid";
import { MSG } from "../metadata";
import { updateTimeout } from "../services/auto-scan.service";
import { getCtxQueries } from "../services/telegraf.service";

export const addCarScene = new Scenes.WizardScene<Scenes.WizardContext>('addCar',
    (ctx) => {
        const text = (ctx.message as Message.TextMessage).text;

        if (text === "Отмена") {
            ctx.scene.leave();
            ctx.replyWithMarkdownV2(
                MSG.mainMenu, 
                getMainMenuKeyboard(getCtxQueries(ctx))
            );
            return;
        }

        if (text && isValidUrl(text)) {
            (ctx.wizard.state as any).link = text;
            ctx.replyWithMarkdownV2(MSG.enterQueryName);
            ctx.wizard.next();
        } else {
            ctx.replyWithMarkdownV2(MSG.invalidQueryLink, { disable_web_page_preview: true });
        }
    },
    (ctx) => {
        const { text } = ctx.message as Message.TextMessage;
        const state = ctx.wizard.state as any;

        const ctxQueries = getCtxQueries(ctx);

        if (text === "Отмена") {
            ctx.scene.leave();
            ctx.replyWithMarkdownV2(
                MSG.mainMenu, 
                getMainMenuKeyboard(ctxQueries)
            );
            return;
        }
        
        if (text && !state.loading) {
            const query: Query = {
                id: uuid.generate(),
                name: text,
                link: state.link,
                scanFrequency: ScanFrequency.Day1,
                nextCheck: new Date(), // To run first check immediately
                checkInProcess: false,
                cars: null,
                userId: ctx.from.id,
            };

            state.loading = true;
            db.queries.saveQuery(query).subscribe(
                {
                    next() {
                        allQueries.push(query);
                        updateTimeout(query);
                        ctx.reply(
                            MSG.querySaved,
                            getMainMenuKeyboard(ctxQueries)
                        );
                        ctx.scene.leave();
                    },
                    error() {
                        ctx.reply(MSG.errorDuringSaving);
                        ctx.scene.leave();
                    }
                });
        }
    }
);