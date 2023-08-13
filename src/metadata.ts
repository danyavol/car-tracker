import { Query } from "./interfaces/query.interface";
import { escapeReservedSymbols as escape } from './services/escape.service';
import { getNextScanTitle, getScanFrequencyName } from "./services/query.service";

export const MSG = {
    changeCheckFrequency: (query: Query) => `Выберите как часто бот будет выполнять автоматическую проверку по запросу ${getQueryName(query)}\n\n_В случае обнаружения изменения Вы получите уведомление_`,
    mainMenu: '〽 *Главное меню*\nИспользуйте клавиатуру внизу экрана ⤵',
    
    queryList: (hasQueries: boolean) => '*Ваши сохраненные запросы:*' 
        + (hasQueries ? '' : '\n\n_У Вас нету запросов_'), 
    queryCheckStarted: (query: Query) => `Началась проверка по запросу ${getQueryName(query)}`,
    queryCheckEnded: (hasChanges: boolean) => 'Проверка завершена' + (hasChanges ? '' : '\n\n_Изменений не найдено_'),
    enterQueryLink: 'Введите ссылку запроса\\. Поддерживаются следующие сайты:\n'
        + `\n_${escape('cars.av.by')}_`
        + `\n_${escape('otomoto.pl')}_`,
    enterQueryName: "Введите название запроса\\. Благодаря названию Вы сможете отличать запросы друг от друга",
    renameQuery: "Введите новое название запроса",
    invalidQueryLink: "*Неверная ссылка*\nпример:\n\n_https://cars\\.av\\.by/filter_",
    querySaved: "Ваша ссылка успешно сохранена",
    errorDuringSaving: "Произошла ошикба при сохранении",
    querySettingsMenu: (query: Query) => `Запрос: ${getQueryName(query)}`
        + `\n\nАвто\\-проверка: *${getScanFrequencyName(query.scanFrequency)}*`
        + (query.nextScan ? `\nСлед\\. проверка: *${escape(getNextScanTitle(query.nextScan))}*` : ''),
    confirmDeleteQuery: (query: Query) => `Вы уверены, что хотите удалить запрос ${getQueryName(query)}?`,
    queryDeleted: 'Запрос успешно удален',
    queryDeleteError: 'Произошла ошибка во время удаления запроса',
    checkInProcess: 'Проверка по данному запросу уже выполняется',
    queryRenamed: 'Запрос успешно переименован',
    errorTryLater: 'Произошла ошибка\\. Попробуйте позже'
};

function getQueryName(query: Query): string {
    return `[${escape(query.name)}](${query.link})`;
}