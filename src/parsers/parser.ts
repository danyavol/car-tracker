import { first, map, Observable, switchMap, tap } from "rxjs";
import { updateTimeout } from "../services/auto-scan.service";
import { getNextScanDate } from "../services/query.service";
import { db } from "../database/database";
import { Car } from "../interfaces/car.interface";
import { ChangeNotice, Parser } from "../interfaces/parser.interface";
import { Query } from "../interfaces/query.interface";
import { getChangeMsgs } from "../services/change-msg.service";
import { compareCars } from "../services/compare.service";
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

export function runQueryScan(query: Query): Observable<ChangeNotice[]> {
    query.checkInProcess = true;
    query.nextScan = getNextScanDate(query.scanFrequency);

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
            map(() => changeNotices)
        )),
        tap(() => {
            query.checkInProcess = false;
            updateTimeout(query);
        }),
        first()
    );
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