export interface CompareConfig<T> {
    getId(item: T): string | number;
    isEqual(item1: T, item2: T): boolean;
}

export interface CompareResult<T> {
    added: T[];
    deleted: T[];
    edited: { old: T, new: T }[];
}