import { catchError, finalize, map, of } from 'rxjs';
import { Markup, Scenes, session } from 'telegraf';
import { bot } from './config';
import { db } from './database/database';
import { Action } from './interfaces/actions.interface';
import { Query } from './interfaces/query.interface';
import { getCarListKeyboard, getCarSettingsKeyboard, getDeleteQueryKeyboard, getFrequencyKeyboard, getMainMenuKeyboard } from './keyboards/keyboards';
import { MSG } from './metadata';
import { sessionMiddleware } from './middlewares/session.middleware';
import { parseAndSaveCar } from './parsers/parser';
import { addCarScene } from './scenes/add-car.scene';
import { escapeReservedSymbols as escape } from './services/escape.service';
import { getQueryName } from './services/query.service';
import { getCtxSession } from './services/telegraf.service';

bot.use(sessionMiddleware);

/** Stage middleware */
const stage = new Scenes.Stage<Scenes.WizardContext>([addCarScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
    ctx.replyWithMarkdownV2(
        MSG.mainMenu, 
        getMainMenuKeyboard(getCtxSession(ctx))
    );
});

bot.hears(/новый запрос/i, (ctx) => {
    ctx.replyWithMarkdownV2(
        MSG.enterQueryLink, 
        Markup.keyboard([["Отмена"]]).resize());
    ctx.scene.enter('addCar', null, true);
});

bot.hears(/мои запросы/i, (ctx) => {
    const session = getCtxSession(ctx);
	ctx.replyWithMarkdownV2(
        MSG.queryList(!!session.queries.length), 
        getCarListKeyboard(session)
    );
});

bot.on('callback_query', (ctx) => {
    const data = JSON.parse(ctx.callbackQuery.data);
    const currSession = getCtxSession(ctx);
    const query = currSession.queries.find(q => q.id === data.queryId);

    switch(data.action) {
        case Action.OpenCarsList:
            ctx.editMessageText(
                MSG.queryList(!!currSession.queries.length), 
                { parse_mode: "MarkdownV2", reply_markup: getCarListKeyboard(currSession).reply_markup }
            );
            break;
        case Action.OpenCar:
            ctx.editMessageText(
                MSG.queryInfo(query),
                { 
                    disable_web_page_preview: true, 
                    reply_markup: getCarSettingsKeyboard(query).reply_markup,
                    parse_mode: "MarkdownV2"
                }
            );
            break;
        case Action.RunCarCheck:
            ctx.deleteMessage();
            ctx.replyWithMarkdownV2(
                MSG.queryCheckStarted(query), 
                { disable_web_page_preview: true }
            );
            parseAndSaveCar(query).subscribe((notices) => {
                ctx.replyWithMarkdownV2(MSG.queryCheckEnded(!!notices.length)).then(() => {
                    notices.forEach(notice => {
                        ctx.replyWithPhoto(notice.photo, { caption: notice.message, parse_mode: 'MarkdownV2' });
                    });
                });
            });
            break;
        case Action.CheckFrequency:
            ctx.editMessageText(
                MSG.changeCheckFrequency(query),
                { 
                    disable_web_page_preview: true,
                    reply_markup: getFrequencyKeyboard(query).reply_markup, 
                    parse_mode: 'MarkdownV2' 
                }
            );
            break;
        case Action.UpdateCheckFrequency:
            if (query.checkFrequency === data.fr) break;
            const newQuery: Query = { ...query, checkFrequency: data.fr };
            db.queries.saveQuery(newQuery).subscribe({
                next() {
                    query.checkFrequency = data.fr;
                    ctx.answerCbQuery("Успешно сохранено");
                    ctx.editMessageText(
                        MSG.changeCheckFrequency(query),
                        {
                            parse_mode: "MarkdownV2",
                            disable_web_page_preview: true,
                            reply_markup: getFrequencyKeyboard(query).reply_markup
                        }
                    )
                },
                error() {
                    ctx.answerCbQuery("Произошла ошибка при сохранении");
                    ctx.editMessageText(
                        MSG.changeCheckFrequency(query),
                        {
                            parse_mode: "MarkdownV2",
                            disable_web_page_preview: true,
                            reply_markup: getFrequencyKeyboard(query).reply_markup
                        }
                    )
                }
            });
            break;
        case Action.ConfirmDeleteQuery:
            ctx.editMessageText(
                MSG.confirmDeleteQuery(query),
                {
                    disable_web_page_preview: true,
                    parse_mode: "MarkdownV2",
                    reply_markup: getDeleteQueryKeyboard(query).reply_markup
                }
            );
            break;
        case Action.DeleteQuery:
            db.queries.deleteQuery(query.id).pipe(
                map(() => {
                    const index = currSession.queries.findIndex(q => q.id === query.id);
                    currSession.queries.splice(index, 1);

                    return MSG.queryDeleted;
                }),
                catchError(() => of(MSG.queryDeleteError))
            ).subscribe((msg) => {
                ctx.answerCbQuery(msg);
                ctx.editMessageText(MSG.queryList(!!currSession.queries.length), {
                    parse_mode: "MarkdownV2",
                    reply_markup: getCarListKeyboard(currSession).reply_markup
                });
            });
            break;
        default:
            ctx.reply('В разработке');
            break;
    }
});



bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));