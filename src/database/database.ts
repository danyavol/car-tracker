import { FirebaseOptions, initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { collection, CollectionReference, doc, DocumentReference, Firestore, getDocs, getFirestore, setDoc } from 'firebase/firestore/lite';
import { catchError, EMPTY, first, from, map, Observable, ReplaySubject, switchMap, throwError } from "rxjs";
import { firebaseAuth, firebaseConfig } from "../config";
import { UsersCollection } from "./users";

export enum Collections {
    Users = 'users',
    Queries = 'queries',
}

class Database {
    private db: Firestore;
    private dbReady$ = new ReplaySubject<void>();

    public users: UsersCollection;

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
    }

    // saveMessage(message: any): Observable<void> {
    //     const docId = `${message.chat.id}:${message.message_id}`;
    //     const ref = doc(this.db, Collections.Messages, docId) as DocumentReference<any>;
        
    //     return this.dbReady$.pipe( 
    //         switchMap(() => from(setDoc(ref, message)).pipe(
    //             first(),
    //             catchError((err) => {
    //                 console.error('Error during saving message!', err);
    //                 return EMPTY;
    //             })
    //         ))
    //     );
    // }

    // getAllMessages(): Observable<any[]> {
    //     const messagesRef = collection(this.db, Collections.Messages) as CollectionReference<any>;
        
    //     return this.dbReady$.pipe( 
    //         switchMap(() => from(getDocs(messagesRef)).pipe(
    //             first(),
    //             map((snap) => {
    //                 return snap.docs.map((doc) => doc.data());
    //             }),
    //             catchError((err) => {
    //                 console.error('Error during getting all messages!', err);
    //                 return throwError(() => err);
    //             })
    //         ))
    //     );
    // }
}

export const db = new Database(firebaseConfig, firebaseAuth);