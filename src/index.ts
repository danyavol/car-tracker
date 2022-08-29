import { db } from './database/database';
import { bot } from './config';

bot.on('message', (ctx, next) => {
    const { first_name, last_name, username } = ctx.update.message.from;
    console.log(first_name, last_name, username, 123);
    next();
});

bot.launch();