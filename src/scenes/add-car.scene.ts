import { db } from "src/database/database";
import { CheckFrequency } from "src/interfaces/check-frequency.interface";
import { Query } from "src/interfaces/query.interface";
import { getMainMenuKeyboard } from "src/keyboards/keyboards";
import { isValidUrl } from "src/parsers/parser";
import { getCtxSession } from "src/services/telegraf.service";
import { session } from "src/services/user-session.service";
import { Scenes } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";

export const addCarScene = new Scenes.WizardScene<Scenes.WizardContext>('addCar',
    (ctx) => {
        const text = (ctx.message as Message.TextMessage).text;

        if (text === "Отмена") {
            ctx.scene.leave();
            ctx.replyWithMarkdownV2(
                '〽 *Главное меню*', 
                getMainMenuKeyboard(getCtxSession(ctx))
            );
            return;
        }

        if (text && isValidUrl(text)) {
            (ctx.wizard.state as any).link = text;
            ctx.reply("Введите название для ссылки");
            ctx.wizard.next();
        } else {
            ctx.replyWithMarkdownV2("*Неверная ссылка*\nпример:\n\n_https://cars\\.av\\.by/filter_", { disable_web_page_preview: true });
        }
    },
    (ctx) => {
        const { text } = ctx.message as Message.TextMessage;
        const state = ctx.wizard.state as any;

        if (text === "Отмена") {
            ctx.scene.leave();
            ctx.replyWithMarkdownV2(
                '〽 *Главное меню*', 
                getMainMenuKeyboard(getCtxSession(ctx))
            );
            return;
        }
        
        if (text && !state.loading) {
            const query: Query = {
                id: '123',
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
                            "Ваша ссылка успешно сохранена",
                            getMainMenuKeyboard(session.get(ctx.from.id))
                        );
                        ctx.scene.leave();
                    },
                    error() {
                        ctx.reply("Произошла ошикба при сохранении");
                        ctx.scene.leave();
                    }
                });
        }
    }
);