import { Action } from "src/interfaces/actions.interface";
import { CheckFrequency } from "src/interfaces/check-frequency.interface";
import { Query } from "src/interfaces/query.interface";
import { SessionData } from "src/interfaces/session.interface";
import { getCheckFrequencyName } from "src/services/query.service";
import { Markup } from "telegraf";

export function getMainMenuKeyboard(session: SessionData) {
	return Markup.keyboard([
        [{ text: '🚗 Мои запросы', hide: !session.queries.length }],
        ['💾 Новый запрос'],
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
                action: Action.RunCarCheck, queryId: query.id
            }),
            text: "✅ Выполнить проверку"
        }],
        [{ 
            callback_data: JSON.stringify({ 
                action: Action.CheckFrequency, queryId: query.id
            }),
            text: "⏱ Автоматическая проверка"
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
        [{
            callback_data: JSON.stringify({action: Action.OpenCarsList}),
            text: "« Назад"
        }]
    ]);
}

export function getFrequencyKeyboard(query: Query) {
    return Markup.inlineKeyboard([
        ...Object.keys(CheckFrequency).map(key => [{
            callback_data: JSON.stringify({
                action: Action.UpdateCheckFrequency,
                queryId: query.id,
                fr: CheckFrequency[key]
            }),
            text: (query.checkFrequency === CheckFrequency[key] ? "✅ " : "") + getCheckFrequencyName(CheckFrequency[key]),
            
        }]),
        [{
            callback_data: JSON.stringify({action: Action.OpenCar, queryId: query.id}),
            text: "« Назад"
        }]
    ]);
}