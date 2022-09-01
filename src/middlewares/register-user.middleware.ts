import { db } from "../database/database";
import { User } from "../interfaces/user.interface";
import { allUsers } from "../services/storage.service";
import { getSender } from "../services/telegraf.service";
import { Context, MiddlewareFn } from "telegraf";

export const registerUserMiddleware: MiddlewareFn<Context> = (ctx, next) => {
    const sender = getSender(ctx);
    
    if (!sender) return next();
    if (allUsers.find(u => u.id === sender.id)) return next();

    const newUser: User = {
        id: sender.id,
        firstName: sender.first_name,
        lastName: sender.last_name || null,
        username: sender.username || null,
        registerDate: new Date()
    };

    db.users.saveUser(newUser).subscribe({
        next() {
            allUsers.push(newUser);
            next();
        },
        error(e) {
            console.error('Saving new user error', e);
            ctx.reply('Произошла ошибка во время получения данных. Попробуйте позже.');
        }
    });
}