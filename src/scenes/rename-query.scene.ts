import { Scenes } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { db } from "../database/database";
import { Query } from "../interfaces/query.interface";
import { getMainMenuKeyboard } from "../keyboards/keyboards";
import { MSG } from "../metadata";
import { getCtxQueries } from "../services/telegraf.service";

interface SceneState {
    query: Query;
}

export const renameQueryScene = new Scenes.WizardScene<Scenes.WizardContext>('renameQuery',
    (ctx) => {
        const state = ctx.wizard.state as SceneState;
        const text = (ctx.message as Message.TextMessage).text;

        if (text === "Отмена") {
            ctx.scene.leave();
            ctx.replyWithMarkdownV2(
                MSG.mainMenu, 
                getMainMenuKeyboard(getCtxQueries(ctx))
            );
            return;
        }

        if (text) {
            const newQuery: Query = { ...state.query, name: text };

            db.queries.saveQuery(newQuery).subscribe({
                next() {
                    state.query.name = newQuery.name;

                    ctx.replyWithMarkdownV2(
                        MSG.queryRenamed,
                        getMainMenuKeyboard(getCtxQueries(ctx))
                    );
                    ctx.scene.leave();
                },
                error() {
                    ctx.replyWithMarkdownV2(
                        MSG.errorTryLater,
                        getMainMenuKeyboard(getCtxQueries(ctx))
                    );
                    ctx.scene.leave();
                }
            });
        }
    }
);