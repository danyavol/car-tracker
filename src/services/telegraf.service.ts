import { SessionData } from "src/interfaces/session.interface";
import { Context } from "telegraf";
import { Update, User } from "telegraf/typings/core/types/typegram";
import { session } from "./user-session.service";

export function getSender(ctx: Context): User {
    if (ctx.updateType === "message") 
        return ctx.message.from;
    if (ctx.updateType === "callback_query") 
        return (ctx.update as Update.CallbackQueryUpdate).callback_query.from;
    return null;
}

export function getCtxSession(ctx: Context): SessionData {
    return session.get(getSender(ctx).id);
}