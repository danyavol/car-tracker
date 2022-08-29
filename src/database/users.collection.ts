import { Firestore } from "firebase/firestore/lite";
import { Observable } from "rxjs";

export class UsersCollection {
    constructor(
        private db: Firestore,
        private dbReady$: Observable<void>
    ) { }

    getUser(username: string) {}

    saveUser() {}
}