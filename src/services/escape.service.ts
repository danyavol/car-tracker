const reservedSymbols = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];

export function escapeReservedSymbols(text: string): string {
    reservedSymbols.forEach(s => {
        text = text.replaceAll(s, '\\' + s);
    });
    return text;
}