import { Currency } from "./currency.interface";

export interface OtomotoCarData {
    id: string;
    title: string;
    createdAt: string;
    shortDescription: string;
    url: string;
    location: {
        city: {
            name: string;
        },
        region: {
            name: string;
        },
    },
    thumbnail: {
        x1: string;
        x2: string;
    },
    price: {
        amount: {
            units: number,
            currencyCode: Currency;
        },
    },
    parameters: [
        {
            key: "fuel_type";
            displayValue: string;
            value: string;
        },
        {
            key: "gearbox";
            displayValue: string;
            value: string;
        },
        {
            key: "mileage";
            displayValue: string;
            value: string;
        },
        {
            key: "engine_capacity";
            displayValue: string;
            value: string;
        },
        {
            key: "engine_power";
            displayValue: string;
            value: string;
        },
        {
            key: "year";
            displayValue: string;
            value: string;
        },
    ],
}