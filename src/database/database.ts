import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { Firestore, getFirestore } from 'firebase/firestore/lite';
import { catchError, EMPTY, first, from, ReplaySubject } from "rxjs";
import { firebaseAuth, firebaseConfig } from "../config";
import { QueriesCollection } from "./queries.collection";
import { UsersCollection } from "./users.collection";

export enum Collections {
    Users = 'users',
    Queries = 'queries',
}

class Database {
    private db: Firestore;
    private dbReady$ = new ReplaySubject<void>();

    public users: UsersCollection;
    public queries: QueriesCollection;

    constructor(
        dbConfig: FirebaseOptions,
        authConfig: { login: string, password: string }
    ) {
        const app = initializeApp(dbConfig);
        this.db = getFirestore(app)
       
        from(signInWithEmailAndPassword(getAuth(app), authConfig.login, authConfig.password)).pipe(
            first(),
            catchError((err) => {
                console.error('Error authentication!', err);
                return EMPTY;
            })
        ).subscribe(() => {
            this.dbReady$.next();
        });

        this.users = new UsersCollection(this.db, this.dbReady$);
        this.queries = new QueriesCollection(this.db, this.dbReady$);
    }
}

export const db = new Database(firebaseConfig, firebaseAuth);