import { catchError, combineLatestAll, defer, from, map, mergeAll, Observable, of, switchMap } from "rxjs";
import { Car, GetAllCarsResult } from "../interfaces/car.interface";
import { Parser } from "../interfaces/parser.interface";
import { JSDOM } from "jsdom";
import axios from "axios";


export class AvByParser implements Parser {
    private readonly itemsPerPage = 25;
    private totalItems = 0;
    private get totalPages() {
        return Math.ceil(this.totalItems / this.itemsPerPage);
    }

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
                this.totalItems = this.getTotalCars(dom);

                const urls: string[] = [];
                for (let page = 2; page <= this.totalPages; page++) {
                    const url = new URL(this.url);
                    url.searchParams.set('page', page.toString());
                    urls.push(url.href);
                }

                const obs = urls.map(url => defer(() =>
                    from(axios.get<string>(url)).pipe(catchError((err) => {
                        console.error('Error during getting cars from av.by', err);
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
                console.error('Error during getting cars from av.by', err);
                hadErrors = true;
                return of([[]])
            }),
            map(results => ({
                hadErrors,
                cars: [].concat(...results)
            })),
        );
    }

    private getTotalCars(dom: JSDOM): number {
        const title = dom.window.document.getElementsByClassName('listing__title')[0];
        if (!title) return 0;

        const countString = title.childNodes[4].nodeValue.replace(/\s/g, '');
        return parseInt(countString) || 0;
    }

    private getCars(dom: JSDOM): Car[] {
        const items = dom.window.document.querySelectorAll('.listing-item');

        return Array.from(items).map(item => {
            const link = (new URL(this.url)).origin + (item.querySelector('.listing-item__link') as HTMLLinkElement).href;
            const id = (new URL(link)).pathname.split('/').pop();
            const priceString = item.querySelector('.listing-item__priceusd').textContent;

            const params = item.querySelectorAll('.listing-item__params > div');
            const descriptionNodes = params[1].childNodes;

            return {
                id: 'av-by:' + id,
                link: link,
                name: item.querySelector('.link-text').textContent,
                city: item.querySelector('.listing-item__location').textContent,
                last_update: item.querySelector('.listing-item__date').textContent,
                preview_image: (item.querySelector('.listing-item__photo img') as HTMLImageElement).dataset.srcset.split(' ')[0],
                price_usd: parseInt(priceString.slice(1, -1).replace(/\s/g, '')),
                year: parseInt(params[0].textContent.slice(0, 4)),
                mileage: parseInt(params[2].textContent.replace(/\D/g, '')),
                body_type: descriptionNodes[12].nodeValue,
                engine_capacity: descriptionNodes[4].nodeValue,
                engine_type: descriptionNodes[8].nodeValue,
                transmission_type: descriptionNodes[0].nodeValue
            };
        });
    }
}