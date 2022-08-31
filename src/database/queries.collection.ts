import { collection, CollectionReference, doc, DocumentReference, Firestore, getDoc, getDocs, query, setDoc, where } from "firebase/firestore/lite";
import { catchError, EMPTY, first, from, map, Observable, switchMap } from "rxjs";
import { Query } from "src/interfaces/query.interface";
import { User } from "src/interfaces/user.interface";
import { Collections } from "./database";

export class QueriesCollection {
    constructor(
        private db: Firestore,
        private dbReady$: Observable<void>
    ) { }

    getQuery(queryId: string): Observable<Query> {
        const ref = doc(this.db, Collections.Queries, queryId) as DocumentReference<Query>;
        return this.dbReady$.pipe( 
            switchMap(() => from(getDoc(ref)).pipe(
                first(),
                map((doc) => {
                    return doc.data();
                }),
                catchError((err) => {
                    console.error('Error during getting query!', err);
                    return EMPTY;
                })
            ))
        );
    }

    getUserQueries(userId: number): Observable<Query[]> {
        const ref = collection(this.db, Collections.Queries) as CollectionReference<Query>;
        const dbQuery = query(ref, where("userId", "==", userId)); 
        return this.dbReady$.pipe( 
            switchMap(() => from(getDocs(dbQuery)).pipe(
                first(),
                map((snap) => {
                    return snap.docs.map(doc => doc.data());
                }),
                catchError((err) => {
                    console.error('Error during getting user queries!', err);
                    return EMPTY;
                })
            ))
        );
    }

    saveQuery(query: Query): Observable<void> {
        const ref = doc(this.db, Collections.Queries, query.id) as DocumentReference<Query>;
        
        return this.dbReady$.pipe( 
            switchMap(() => from(setDoc(ref, query)).pipe(
                first(),
                catchError((err) => {
                    console.error('Error during saving query!', err);
                    return EMPTY;
                })
            ))
        );
    }
}