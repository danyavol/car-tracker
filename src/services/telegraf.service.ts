import { Query } from "src/interfaces/query.interface";
import { Context } from "telegraf";
import { Update, User } from "telegraf/typings/core/types/typegram";
import { allQueries } from "./storage.service";

export function getSender(ctx: Context): User {
    if (ctx.updateType === "message") 
        return ctx.message.from;
    if (ctx.updateType === "callback_query") 
        return (ctx.update as Update.CallbackQueryUpdate).callback_query.from;
    return null;
}

export function getCtxQueries(ctx: Context): Query[] {
    const userId = getSender(ctx)?.id;
    return allQueries.filter(q => q.userId === userId);
}

export function getUserQueries(userId: number): Query[] {
    return allQueries.filter(q => q.userId === userId);
}