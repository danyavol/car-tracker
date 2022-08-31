import { Observable } from "rxjs";
import { GetAllCarsResult } from "./car.interface";

export abstract class Parser {
    abstract getAllCars(): Observable<GetAllCarsResult>;
}

export interface ChangeNotice {
    photo: string;
    message: string;
}