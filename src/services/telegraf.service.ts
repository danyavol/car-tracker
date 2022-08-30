import { Context } from "telegraf";
import { Update, User } from "telegraf/typings/core/types/typegram";

export function getSender(ctx: Context): User {
    if (ctx.updateType === "message") 
        return ctx.message.from;
    if (ctx.updateType === "callback_query") 
        return (ctx.update as Update.CallbackQueryUpdate).callback_query.from;
}