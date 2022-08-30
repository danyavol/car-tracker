import { switchMap, tap } from "rxjs";
import { db } from "src/database/database";
import { User } from "src/interfaces/user.interface";
import { getSender } from "src/services/telegraf.service";
import { session } from "src/services/user-session.service";
import { Context, MiddlewareFn } from "telegraf";

export const sessionMiddleware: MiddlewareFn<Context> = (ctx, next) => {
    const sender = getSender(ctx);

    if (session.has(sender.id)) return next();

    db.users.getUser(sender.id).pipe(
        switchMap((user) => {
            if (!user) {
                const newUser: User = {
                    id: sender.id,
                    firstName: sender.first_name,
                    lastName: sender.last_name || null,
                    username: sender.username || null,
                    queryIds: []
                };
                session.set(newUser.id, { queries: [] });

                return db.users.saveUser(newUser);
            } else {
                return db.queries.getQueries(user.queryIds).pipe(
                    tap(queries => session.set(sender.id, { queries }))
                );
            }
        })
    )
    .subscribe({
        next()  {
            console.log(session.get(sender.id));
            next();
        },
        error(e) {
            console.log('Load session error', e);
            ctx.reply('Произошла ошибка во время получения данных. Попробуйте позже.');
        }
    });    
}