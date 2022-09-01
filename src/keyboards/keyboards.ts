import { Action } from "src/interfaces/actions.interface";
import { CheckFrequency } from "src/interfaces/check-frequency.interface";
import { Query } from "src/interfaces/query.interface";
import { getCheckFrequencyName } from "src/services/query.service";
import { Markup } from "telegraf";

export function getMainMenuKeyboard(queries: Query[]) {
	return Markup.keyboard([
        [{ text: '🚗 Мои запросы', hide: !queries.length }],
        ['💾 Новый запрос'],
    ]).resize();
}

export function getCarListKeyboard(queries: Query[]) {
    return Markup.inlineKeyboard([
        ...queries.map(q => [{ callback_data: 
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
                action: Action.ConfirmDeleteQuery, queryId: query.id
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

export function getDeleteQueryKeyboard(query: Query) {
    return Markup.inlineKeyboard([
        [{
            text: "Да",
            callback_data: JSON.stringify({action: Action.DeleteQuery, queryId: query.id}),
        },
        {
            text: "Нет",
            callback_data: JSON.stringify({action: Action.OpenCar, queryId: query.id}),
        }]
    ])
}