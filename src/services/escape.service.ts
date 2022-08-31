const reservedSymbols = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

export function escapeReservedSymbols(text: string): string {
    reservedSymbols.forEach(s => {
        text = text.replace(s, '\\' + s);
    });
    return text;
}