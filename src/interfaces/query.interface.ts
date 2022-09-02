import { Timestamp } from "firebase/firestore/lite";
import { Car } from "./car.interface";
import { ScanFrequency } from "./scan-frequency.interface";

export interface Query {
    id: string;
    name: string;
    link: string;
    userId: number;
    scanFrequency: ScanFrequency;
    nextCheck: Date;
    checkInProcess: boolean;
    cars: Car[] | null;
}

export interface FirestoreQuery extends Omit<Query, "nextCheck" | "checkInProcess"> {
    nextCheck: Timestamp;
}
