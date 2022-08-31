import { Action } from "src/interfaces/actions.interface";
import { Query } from "src/interfaces/query.interface";
import { SessionData } from "src/interfaces/session.interface";
import { getCheckFrequencyName } from "src/services/query.service";
import { Markup } from "telegraf";

export function getMainMenuKeyboard(session: SessionData) {
	return Markup.keyboard([
        ['💾 Добавить авто'],
        [{ text: '🚗 Мои авто', hide: !session.queries.length }]
    ]).resize();
}

export function getCarListKeyboard(session: SessionData) {
    return Markup.inlineKeyboard([
        ...session.queries.map(q => [{ callback_data: 
            JSON.stringify({action: Action.OpenCar, queryId: q.id}),
            text: q.name 
        }])
    ]);
}

export function getCarSettingsKeyboard(query: Query) {
    return Markup.inlineKeyboard([
        [{ 
            callback_data: JSON.stringify({
                action: Action.CheckCar, queryId: query.id
            }),
            text: "✅ Выполнить проверку"
        }],
        
        [{ 
            callback_data: JSON.stringify({ 
                action: Action.ChangeCheckFrequency, queryId: query.id
            }),
            text: "⏱ " + getCheckFrequencyName(query)
        }],
        [{ 
            callback_data: JSON.stringify({ 
                action: Action.Rename, queryId: query.id
            }),
            text: "✏️ Переименовать"
        }],
        [{ 
            callback_data: JSON.stringify({ 
                action: Action.Delete, queryId: query.id
            }),
            text: "❌ Удалить"
        }],
    ]);
}