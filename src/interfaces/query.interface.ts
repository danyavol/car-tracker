import { Car } from "./car.interface";
import { CheckFrequency } from "./check-frequency.interface";

export interface Query {
    id: string;
    name: string;
    link: string;
    userId: string;
    checkFrequency: CheckFrequency;
    nextCheck: string;
    cars: Car[];
}
