import { Query } from "./interfaces/query.interface";
import { escapeReservedSymbols as escape } from './services/escape.service';

export const MSG = {
    changeCheckFrequency: (query: Query) => `Выберите как часто бот будет выполнять автоматическую проверку по запросу ${getQueryName(query)}\n\n_В случае обнаружения изменения Вы получите уведомление_`,
    mainMenu: '〽 *Главное меню*\nИспользуйте клавиатуру внизу экрана ⤵',
    
    queryList: (hasQueries: boolean) => '*Ваши сохраненные запросы:*' 
        + (hasQueries ? '' : '\n\n_У Вас нету запросов_'), 
    queryCheckStarted: (query: Query) => `Началась проверка по запросу [${getQueryName(query)})`,
    queryCheckEnded: (hasChanges: boolean) => 'Проверка закончена' + (hasChanges ? '' : '\n\n_Изменений не найдено_'),
    enterQueryLink: 'Введите ссылку\\. Поддерживаются следующие сайты:\n'
        + `\n_${escape('cars.av.by')}_`,
    enterQueryName: "Введите название для ссылки",
    invalidQueryLink: "*Неверная ссылка*\nпример:\n\n_https://cars\\.av\\.by/filter_",
    querySaved: "Ваша ссылка успешно сохранена.",
    errorDuringSaving: "Произошла ошикба при сохранении",
    queryInfo: (query: Query) => getQueryName(query)
};

function getQueryName(query: Query): string {
    return `[${escape(query.name)}](${query.link})`;
}