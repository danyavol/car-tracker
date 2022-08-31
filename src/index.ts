import { Markup, Scenes, session } from 'telegraf';
import { bot } from './config';
import { Action } from './interfaces/actions.interface';
import { getCarListKeyboard, getCarSettingsKeyboard, getMainMenuKeyboard } from './keyboards/keyboards';
import { sessionMiddleware } from './middlewares/session.middleware';
import { parseAndSaveCar } from './parsers/parser';
import { addCarScene } from './scenes/add-car.scene';
import { escapeReservedSymbols } from './services/escape.service';
import { getCtxSession } from './services/telegraf.service';

bot.use(sessionMiddleware);

/** Stage middleware */
const stage = new Scenes.Stage<Scenes.WizardContext>([addCarScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
    ctx.replyWithMarkdownV2(
        '〽 *Главное меню*\nИспользуйте клавиатуру внизу экрана ⤵', 
        getMainMenuKeyboard(getCtxSession(ctx))
    );
});

bot.hears(/новый запрос/i, (ctx) => {
    ctx.replyWithMarkdownV2('Введите ссылку. Поддерживаются следующие сайты:\n\n_cars.av.by_', Markup.keyboard([["Отмена"]]).resize());
    ctx.scene.enter('addCar', null, true);
});

bot.hears(/мои запросы/i, (ctx) => {
    const session = getCtxSession(ctx);
    const empty = session.queries.length ? "" : "\n\n_У Вас нету запросов_";
	ctx.replyWithMarkdownV2(
        "*Ваши сохраненные запросы:*" + empty, 
        getCarListKeyboard(session)
    )
});

bot.on('callback_query', (ctx) => {
    const data = JSON.parse(ctx.callbackQuery.data);
    const session = getCtxSession(ctx);
    const query = session.queries.find(q => q.id === data.queryId);

    switch(data.action) {
        case Action.OpenCar:
            ctx.replyWithMarkdownV2(
                `[${escapeReservedSymbols(query.name)}](${query.link})`,
                { 
                    disable_web_page_preview: true, 
                    reply_markup: getCarSettingsKeyboard(query).reply_markup 
                }
            );
            break;
        case Action.CheckCar:
            ctx.replyWithMarkdownV2(
                `Началась проверка по запросу [${escapeReservedSymbols(query.name)}](${query.link})`, 
                { disable_web_page_preview: true }
            );
            parseAndSaveCar(query).subscribe((notices) => {
                const hasChanges = !notices.length ? '\n\n_Изменений не найдено_' : '';
                ctx.replyWithMarkdownV2("Проверка закончена" + hasChanges).then(() => {
                    notices.forEach(notice => {
                        ctx.replyWithPhoto(notice.photo, { caption: notice.message, parse_mode: 'MarkdownV2' });
                    });
                });
            });
            break;
    }
});



bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));