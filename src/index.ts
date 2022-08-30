import { Markup, Scenes, session } from 'telegraf';
import { bot } from './config';
import { Action } from './interfaces/actions.interface';
import { getCarListKeyboard, getMainMenuKeyboard } from './keyboards/keyboards';
import { sessionMiddleware } from './middlewares/session.middleware';
import { addCarScene } from './scenes/add-car.scene';
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

bot.hears(/добавить авто/i, (ctx) => {
    ctx.reply('Введите ссылку', Markup.keyboard([["Отмена"]]).resize());
    ctx.scene.enter('addCar', null, true);
});

bot.hears(/мои авто/i, (ctx) => {
    const session = getCtxSession(ctx);
    const empty = session.queries.length ? "" : "\n\n_Вы еще не добавляли авто_";
	ctx.replyWithMarkdownV2(
        "*Ваши сохраненные авто:*" + empty, 
        getCarListKeyboard(session)
    )
});

bot.on('callback_query', (ctx) => {
    const data = JSON.parse(ctx.callbackQuery.data);

    switch(data.action) {
        case Action.CheckCars:
            
    }
});



bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));