import { Car } from "src/interfaces/car.interface";
import { CompareConfig, CompareResult } from "src/interfaces/compare.interface";

function compareArrays<T>(oldArray: T[], newArray: T[], config: CompareConfig<T>): CompareResult<T> {
    const result: CompareResult<T> = {
        added: [],
        deleted: [],
        edited: []
    };

    oldArray = [...oldArray];

    newArray.forEach(newItem => {
        const newItemId = config.getId(newItem);

        const oldItemIndex = oldArray.findIndex((oldItem) => newItemId === config.getId(oldItem));

        if (oldItemIndex < 0) {
            result.added.push(newItem);
            return;
        }

        if (!config.isEqual(newItem, oldArray[oldItemIndex])) {
            result.edited.push({
                new: newItem,
                old: oldArray[oldItemIndex]
            });
        }

        oldArray.splice(oldItemIndex, 1);
    });

    result.deleted = oldArray;

    return result;
}


export function compareCars(oldArray: Car[], newArray: Car[]): CompareResult<Car> {
    return compareArrays(oldArray, newArray, {
        getId: (car) => car.id,
        isEqual: (car1, car2) => {
            let key: keyof Car;
            for (key in car1) {
                if (car1.price_usd !== car2.price_usd) return false;
            }
            return true;
        }
    });
}