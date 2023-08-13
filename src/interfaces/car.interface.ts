import { Currency } from "./currency.interface";

export interface Car {
    id: string;
    last_update?: string;
    name: string;
    year: number;
    price: number;
    currency: Currency;
    link: string;
    engine_type: string;
    engine_capacity: string;
    body_type?: string;
    transmission_type: string;
    mileage: number;
    city: string;
    preview_image: string;
}

export interface GetAllCarsResult {
    hadErrors: boolean;
    cars: Car[];
}