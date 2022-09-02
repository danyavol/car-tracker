import { catchError, combineLatest, map, of } from 'rxjs';
import { Markup, Scenes, session } from 'telegraf';
import { bot } from './config';
import { db } from './database/database';
import { Action } from './interfaces/actions.interface';
import { Query } from './interfaces/query.interface';
import { getQueryListKeyboard, getQuerySettingsKeyboard, getDeleteQueryKeyboard, getFrequencyKeyboard, getMainMenuKeyboard } from './keyboards/keyboards';
import { MSG } from './metadata';
import { registerUserMiddleware } from './middlewares/register-user.middleware';
import { runQueryScan } from './parsers/parser';
import { addQueryScene } from './scenes/add-query.scene';
import { renameQueryScene } from './scenes/rename-query.scene';
import { updateTimeout } from './services/auto-scan.service';
import { getNextScanDate } from './services/query.service';
import { allQueries, allUsers } from './services/storage.service';
import { getCtxQueries } from './services/telegraf.service';

bot.use(registerUserMiddleware);

/** Stage middleware */
const stage = new Scenes.Stage<Scenes.WizardContext>([addQueryScene, renameQueryScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
    ctx.replyWithMarkdownV2(
        MSG.mainMenu, 
        getMainMenuKeyboard(getCtxQueries(ctx))
    );
});

bot.hears(/новый запрос/i, (ctx) => {
    ctx.replyWithMarkdownV2(
        MSG.enterQueryLink, 
        Markup.keyboard([["Отмена"]]).resize());
    ctx.scene.enter('addQuery', null, true);
});

bot.hears(/мои запросы/i, (ctx) => {
    const queries = getCtxQueries(ctx);
	ctx.replyWithMarkdownV2(
        MSG.queryList(!!queries.length), 
        getQueryListKeyboard(queries)
    );
});

bot.on('callback_query', (ctx) => {
    const data = JSON.parse(ctx.callbackQuery.data);
    const queries = getCtxQueries(ctx);
    const query = queries.find(q => q.id === data.queryId);

    switch(data.action) {
        case Action.QueryList:
            ctx.editMessageText(
                MSG.queryList(!!queries.length), 
                { parse_mode: "MarkdownV2", reply_markup: getQueryListKeyboard(queries).reply_markup }
            );
            break;
        case Action.QuerySettings:
            ctx.editMessageText(
                MSG.querySettingsMenu(query),
                { 
                    disable_web_page_preview: true, 
                    reply_markup: getQuerySettingsKeyboard(query).reply_markup,
                    parse_mode: "MarkdownV2"
                }
            );
            break;
        case Action.RunQueryScan:
            if (query.checkInProcess) {
                ctx.replyWithMarkdownV2(MSG.checkInProcess);
                break;
            }

            ctx.deleteMessage();
            ctx.replyWithMarkdownV2(
                MSG.queryCheckStarted(query), 
                { disable_web_page_preview: true }
            );
            runQueryScan(query).subscribe((notices) => {
                ctx.replyWithMarkdownV2(MSG.queryCheckEnded(!!notices.length)).then(() => {
                    notices.forEach(notice => {
                        ctx.replyWithPhoto(notice.photo, { caption: notice.message, parse_mode: 'MarkdownV2' });
                    });
                });
            });
            break;
        case Action.ScanFrequencyMenu:
            ctx.editMessageText(
                MSG.changeCheckFrequency(query),
                { 
                    disable_web_page_preview: true,
                    reply_markup: getFrequencyKeyboard(query).reply_markup, 
                    parse_mode: 'MarkdownV2' 
                }
            );
            break;
        case Action.ChangeScanFrequency:
            if (query.scanFrequency === data.fr) break;
            const newQuery: Query = { 
                ...query, 
                scanFrequency: data.fr, 
                nextScan: getNextScanDate(data.fr) 
            };
            db.queries.saveQuery(newQuery).subscribe({
                next() {
                    query.scanFrequency = newQuery.scanFrequency;
                    query.nextScan = newQuery.nextScan;
                    updateTimeout(query);
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
        case Action.DeleteQueryConfirmation:
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
            db.queries.deleteQuery(query.id).subscribe({
                next() {
                    const index = allQueries.findIndex(q => q.id === query.id);
                    allQueries.splice(index, 1);
                    const index2 = queries.findIndex(q => q.id === query.id);
                    queries.splice(index2, 1);
                
                    ctx.answerCbQuery(MSG.queryDeleted);
                    ctx.editMessageText(MSG.queryList(!!queries.length), {
                        parse_mode: "MarkdownV2",
                        reply_markup: getQueryListKeyboard(queries).reply_markup
                    });
                },
                error() {
                    ctx.answerCbQuery(MSG.queryDeleteError);
                    ctx.editMessageText(MSG.querySettingsMenu(query), {
                        parse_mode: "MarkdownV2",
                        reply_markup: getQuerySettingsKeyboard(query).reply_markup
                    });
                }
            });
            break;
        case Action.RenameQuery: 
            ctx.replyWithMarkdownV2(
                MSG.renameQuery, 
                Markup.keyboard([["Отмена"]]).resize()
            );
            ctx.scene.enter('renameQuery', { query }, true);
            break;
        default:
            ctx.reply('В разработке');
            break;
    }
});

// Load queries
combineLatest([
    db.users.getAllUsers(),
    db.queries.getAllQueries()
]).subscribe({
    next([users, queries]) {
        allUsers.push(...users);
        allQueries.push(...queries);
        allQueries.forEach(q => updateTimeout(q));
        bot.launch();
        console.log('Bot has started');
    },
    error(err) {
        throw Error(err);
    }
});

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));