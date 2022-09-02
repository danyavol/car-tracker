import { Action } from "../interfaces/actions.interface";
import { ScanFrequency } from "../interfaces/scan-frequency.interface";
import { Query } from "../interfaces/query.interface";
import { getScanFrequencyName } from "../services/query.service";
import { Markup } from "telegraf";

export function getMainMenuKeyboard(queries: Query[]) {
	return Markup.keyboard([
        [{ text: '🚗 Мои запросы', hide: !queries.length }],
        ['💾 Новый запрос'],
    ]).resize();
}

export function getQueryListKeyboard(queries: Query[]) {
    return Markup.inlineKeyboard([
        ...queries.map(q => [{ callback_data: 
            JSON.stringify({action: Action.QuerySettings, queryId: q.id}),
            text: q.name 
        }])
    ]);
}

export function getQuerySettingsKeyboard(query: Query) {
    return Markup.inlineKeyboard([
        [{ 
            callback_data: JSON.stringify({
                action: Action.RunQueryScan, queryId: query.id
            }),
            text: "✅ Выполнить проверку"
        }],
        [{ 
            callback_data: JSON.stringify({ 
                action: Action.ScanFrequencyMenu, queryId: query.id
            }),
            text: "⏱ Автоматическая проверка"
        }],
        [{ 
            callback_data: JSON.stringify({ 
                action: Action.RenameQuery, queryId: query.id
            }),
            text: "✏️ Переименовать"
        }],
        [{ 
            callback_data: JSON.stringify({ 
                action: Action.DeleteQueryConfirmation, queryId: query.id
            }),
            text: "❌ Удалить"
        }],
        [{
            callback_data: JSON.stringify({action: Action.QueryList}),
            text: "« Назад"
        }]
    ]);
}

export function getFrequencyKeyboard(query: Query) {
    return Markup.inlineKeyboard([
        ...Object.keys(ScanFrequency).map(key => [{
            callback_data: JSON.stringify({
                action: Action.ChangeScanFrequency,
                queryId: query.id,
                fr: ScanFrequency[key]
            }),
            text: (query.scanFrequency === ScanFrequency[key] ? "✅ " : "") + getScanFrequencyName(ScanFrequency[key]),
            
        }]),
        [{
            callback_data: JSON.stringify({action: Action.QuerySettings, queryId: query.id}),
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
            callback_data: JSON.stringify({action: Action.QuerySettings, queryId: query.id}),
        }]
    ])
}