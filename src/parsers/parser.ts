import { map, Observable, switchMap, tap } from "rxjs";
import { db } from "src/database/database";
import { Car } from "src/interfaces/car.interface";
import { ChangeNotice, Parser } from "src/interfaces/parser.interface";
import { Query } from "src/interfaces/query.interface";
import { getChangeMsgs } from "src/services/change-msg.service";
import { compareCars } from "src/services/compare.service";
import { session } from "src/services/user-session.service";
import { AvByParser } from "./av-by.parser";

export function isValidUrl(url: string): boolean {
    return getParser(url) !== null;
}

export function getParser(url: string): Parser | null {
    if (/^https?:\/\/cars.av.by\/filter/.test(url)) {
        return new AvByParser(url);
    }
    return null;
}

export function parseAndSaveCar(query: Query): Observable<ChangeNotice[]> {
    query = { ...query };
    return getParser(query.link).getAllCars().pipe(
        map((result) => {
            let changeNotices: ChangeNotice[] = []
            if (!query.cars) {
                // first check
                query.cars = result.cars;
            } else {
                const compareResult = compareCars(query.cars, result.cars);
                changeNotices = getChangeMsgs(query, compareResult, result.hadErrors);
                query.cars = getCarsForSave(query.cars, result.cars, result.hadErrors);
            }
            return { changeNotices, query };
        }),
        switchMap(({query, changeNotices}) => db.queries.saveQuery(query).pipe(
            tap(() => {
                const sessionData = session.get(query.userId);
                const index = sessionData.queries.findIndex(q => q.id = query.id);
                sessionData.queries[index] = query;
            }),
            map(() => {
                return changeNotices;
            })
        )),
    )
}

function getCarsForSave(oldCars: Car[], newCars: Car[], hadErrors: boolean): Car[] {
    if (!hadErrors) return newCars;

    const forSave: Car[] = [...oldCars];

    newCars.forEach(car => {
        const index = forSave.findIndex(c => c.id === car.id);
        if (index < 0) forSave.push(car);
        else forSave[index] = car;
    });

    return forSave;
}