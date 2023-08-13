import { catchError, combineLatestAll, defer, from, map, mergeAll, Observable, of, switchMap } from "rxjs";
import { Car, GetAllCarsResult } from "../interfaces/car.interface";
import { Parser } from "../interfaces/parser.interface";
import { JSDOM } from "jsdom";
import axios from "axios";
import { OtomotoCarData } from "src/interfaces/otomoto.interface";

export class OtomotoParser implements Parser {
    private url: string;

    constructor(url: string) {
        const parsedUrl = new URL(url);
        parsedUrl.searchParams.set('page', '1');

        this.url = parsedUrl.href;
    }

    getAllCars(): Observable<GetAllCarsResult> {
        let hadErrors = false;
        return from(
            axios.get<string>(this.url)
        ).pipe(
            switchMap(response => {
                const dom = new JSDOM(response.data);
                const lastPagBtn = dom.window.document.querySelector('[data-testid="pagination-step-forwards"]')?.previousElementSibling;

                const urls: string[] = [];
                if (lastPagBtn) {
                    const lastPage = parseInt(lastPagBtn.textContent);

                    for (let page = 2; page <= lastPage; page++) {
                        const url = new URL(this.url);
                        url.searchParams.set('page', page.toString());
                        urls.push(url.href);
                    }
                }

                const obs = urls.map(url => defer(() =>
                    from(axios.get<string>(url)).pipe(catchError((err) => {
                        console.error('Error during getting cars from otodom.pl', err);
                        hadErrors = true;
                        return of(null);
                    }))
                ));

                return from([of(response), ...obs]);
            }),
            mergeAll(5), // Maximum 5 conccurent requests
            map(response => {
                if (!response) return of([]);
                const dom = new JSDOM(response.data);
                return of(this.getCars(dom));
            }),
            combineLatestAll(),
            catchError((err) => {
                console.error('Error during getting cars from otodom.pl', err);
                hadErrors = true;
                return of([[]])
            }),
            map(results => ({
                hadErrors,
                cars: [].concat(...results)
            })),
        );
    }

    private getCars(dom: JSDOM): Car[] {
        return this.getPageState(dom).map(item => {
            const imgPath = item.thumbnail.x1;
            return {
                id: 'otomoto:' + item.id,
                link: item.url,
                name: item.title,
                city: `${item.location.city.name} (${item.location.region.name})`,
                last_update: item.createdAt,
                preview_image: imgPath.slice(0, imgPath.indexOf(';s=')),
                price: item.price.amount.units,
                currency: item.price.amount.currencyCode,
                year: parseInt(item.parameters.find(item => item.key === "year")?.value ?? "0"),
                mileage: parseInt(item.parameters.find(item => item.key === "mileage")?.value ?? "0"),
                engine_capacity: item.parameters.find(item => item.key === "engine_capacity")?.displayValue ?? null,
                engine_type: item.parameters.find(item => item.key === "fuel_type")?.displayValue ?? null,
                transmission_type: item.parameters.find(item => item.key === "gearbox")?.displayValue ?? null
            };
        });
    }

    private getPageState(dom: JSDOM): OtomotoCarData[] {
        const __NEXT_DATA__ = JSON.parse(dom.window.document.getElementById("__NEXT_DATA__").innerHTML);
        const { urqlState } = __NEXT_DATA__.props.pageProps;
        let state;
        for (const key in urqlState) {
            if ((urqlState[key].data as string).startsWith('{\"advertSearch\":')) {
                state = JSON.parse(urqlState[key].data);
                break;
            }
        }
        if (!state) throw Error('Unable to get page data');

        return state.advertSearch.edges.map(edge => edge.node);
    }
}