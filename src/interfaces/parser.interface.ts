import { Observable } from "rxjs";
import { Car } from "./car.interface";

export abstract class Parser {
    abstract getAllCars(): Observable<Car[]>;
}