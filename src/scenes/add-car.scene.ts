import { db } from "src/database/database";
import { CheckFrequency } from "src/interfaces/check-frequency.interface";
import { Query } from "src/interfaces/query.interface";
import { getMainMenuKeyboard } from "src/keyboards/keyboards";
import { isValidUrl } from "src/parsers/parser";
import { getCtxSession } from "src/services/telegraf.service";
import { session } from "src/services/user-session.service";
import { Scenes } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import uuid from "short-uuid";
import { MSG } from "src/metadata";

export const addCarScene = new Scenes.WizardScene<Scenes.WizardContext>('addCar',
    (ctx) => {
        const text = (ctx.message as Message.TextMessage).text;

        if (text === "Отмена") {
            ctx.scene.leave();
            ctx.replyWithMarkdownV2(
                MSG.mainMenu, 
                getMainMenuKeyboard(getCtxSession(ctx))
            );
            return;
        }

        if (text && isValidUrl(text)) {
            (ctx.wizard.state as any).link = text;
            ctx.reply(MSG.enterQueryName);
            ctx.wizard.next();
        } else {
            ctx.replyWithMarkdownV2(MSG.invalidQueryLink, { disable_web_page_preview: true });
        }
    },
    (ctx) => {
        const { text } = ctx.message as Message.TextMessage;
        const state = ctx.wizard.state as any;

        if (text === "Отмена") {
            ctx.scene.leave();
            ctx.replyWithMarkdownV2(
                MSG.mainMenu, 
                getMainMenuKeyboard(getCtxSession(ctx))
            );
            return;
        }
        
        if (text && !state.loading) {
            const query: Query = {
                id: uuid.generate(),
                name: text,
                link: state.link,
                checkFrequency: CheckFrequency.Day1,
                nextCheck: null,
                cars: null,
                userId: ctx.from.id,
            };

            state.loading = true;
            db.queries.saveQuery(query).subscribe(
                {
                    next() {
                        session.get(ctx.from.id).queries.push(query);
                        ctx.reply(
                            MSG.querySaved,
                            getMainMenuKeyboard(session.get(ctx.from.id))
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