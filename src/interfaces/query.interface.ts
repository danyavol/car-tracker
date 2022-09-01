import { Timestamp } from "firebase/firestore/lite";
import { Car } from "./car.interface";
import { CheckFrequency } from "./check-frequency.interface";

export interface Query {
    id: string;
    name: string;
    link: string;
    userId: number;
    checkFrequency: CheckFrequency;
    nextCheck: Date;
    cars: Car[] | null;
}

export interface FirestoreQuery extends Omit<Query, "nextCheck"> {
    nextCheck: Timestamp;
}
