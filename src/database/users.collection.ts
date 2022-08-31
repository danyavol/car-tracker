import { doc, DocumentReference, Firestore, getDoc, setDoc } from "firebase/firestore/lite";
import { catchError, EMPTY, first, from, map, Observable, switchMap, tap } from "rxjs";
import { User } from "src/interfaces/user.interface";
import { Collections } from "./database";

export class UsersCollection {
    constructor(
        private db: Firestore,
        private dbReady$: Observable<void>
    ) { }

    getUser(userId: number) {
        const ref = doc(this.db, Collections.Users, userId.toString()) as DocumentReference<User>;
        
        return this.dbReady$.pipe( 
            switchMap(() => from(getDoc(ref)).pipe(
                map((snap) => {
                    return snap.data();
                }),
                catchError((err) => {
                    console.error('Error during getting user!', err);
                    return EMPTY;
                })
            )),
            first()
        );
    }

    saveUser(user: User) {
        const ref = doc(this.db, Collections.Users, user.id.toString()) as DocumentReference<User>;

        return this.dbReady$.pipe( 
            switchMap(() => from(setDoc(ref, user)).pipe(
                catchError((err) => {
                    console.error('Error during saving the user!', err);
                    return EMPTY;
                })
            )),
            first()
        );
    }
}