import { Car } from "../interfaces/car.interface";
import { CompareResult } from "../interfaces/compare.interface";
import { ChangeNotice } from "../interfaces/parser.interface";
import { Query } from "../interfaces/query.interface";
import { escapeReservedSymbols as escape } from "./escape.service";
import { formatMileage, formatPrice, formatYear } from "./formater.service";

export function getChangeMsgs(query: Query, changes: CompareResult<Car>, hadErrors: boolean): ChangeNotice[] {
    const notices: ChangeNotice[] = [];

    changes.added.forEach(car => {
        notices.push({
            photo: car.preview_image,
            message: `🆕 Новое авто по запросу [${escape(query.name)}](${query.link})\n\n` + getCarInfo(car)
        });
    });

    changes.edited.forEach(car => {
        notices.push({
            photo: car.new.preview_image,
            message: `📝 Изменилось авто по запросу [${escape(query.name)}](${query.link})\n\n` 
                + getEditedCarInfo(car.old, car.new)
        });
    });

    if (!hadErrors) {
        changes.deleted.forEach(car => {
            notices.push({
                photo: car.preview_image,
                message: `🚫 Снялось авто с продажи по запросу [${escape(query.name)}](${query.link})\n\n` + getCarInfo(car)
            });
        });
    }
    
    return notices;
}

function getCarInfo(car: Car): string {
    return `🚙 *[${escape(car.name)}](${car.link})*` 
        + `\n${car.transmission_type}, ${escape(car.engine_capacity)}, ${escape(car.engine_type)}${escape(car.body_type ? ', ' + car.body_type : '')}`
        + `\n${escape(formatYear(car.year))}, ${formatMileage(car.mileage)}`
        + `\n${escape(car.city)}`
        + `\n\n*${escape(formatPrice(car.price, car.currency))}*`;
}

function getEditedCarInfo(oldCar: Car, newCar: Car): string {
    return `🚙 *[${escape(newCar.name)}](${newCar.link})*` 
        + `\n${newCar.transmission_type}, ${escape(newCar.engine_capacity)}, ${escape(newCar.engine_type)}${escape(newCar.body_type ? ', ' + newCar.body_type : '')}`
        + `\n${escape(formatYear(newCar.year))}, ${formatMileage(newCar.mileage)}`
        + `\n~${escape(formatPrice(oldCar.price, oldCar.currency))}~ *${escape(formatPrice(newCar.price, newCar.currency))}*`;
}