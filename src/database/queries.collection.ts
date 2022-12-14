import { collection, deleteDoc, doc, DocumentData, DocumentReference, Firestore, getDocs, QueryDocumentSnapshot, setDoc } from "firebase/firestore/lite";
import { catchError, EMPTY, first, from, map, Observable, switchMap } from "rxjs";
import { FirestoreQuery, Query } from "../interfaces/query.interface";
import { Collections } from "./database";

const queryConverter = {
    toFirestore(query: Query): DocumentData {
        const forSave = { ...query };
        delete forSave.checkInProcess;
        return forSave;
    },
    fromFirestore(
        snapshot: QueryDocumentSnapshot
    ): Query {
        const data = snapshot.data() as FirestoreQuery;
        return { ...data, nextScan: data.nextScan?.toDate() || null, checkInProcess: false };
    }
};

export class QueriesCollection {
    constructor(
        private db: Firestore,
        private dbReady$: Observable<void>
    ) { }

    getAllQueries(): Observable<Query[]> {
        const ref = collection(this.db, Collections.Queries).withConverter(queryConverter);

        return this.dbReady$.pipe(
            switchMap(() => from(getDocs(ref)).pipe(
                map((snap) => {
                    return snap.docs.map(doc => doc.data());
                }),
                catchError((err) => {
                    console.error('Error during getting user queries!', err);
                    return EMPTY;
                })
            )),
            first()
        );
    }

    saveQuery(query: Query): Observable<void> {
        const ref = doc(this.db, Collections.Queries, query.id) as DocumentReference<Query>;

        return this.dbReady$.pipe(
            switchMap(() => from(setDoc(ref, query)).pipe(
                catchError((err) => {
                    console.error('Error during saving query!', err);
                    return EMPTY;
                })
            )),
            first()
        );
    }

    deleteQuery(queryId: string): Observable<void> {
        const ref = doc(this.db, Collections.Queries, queryId) as DocumentReference<Query>;

        return this.dbReady$.pipe(
            switchMap(() => from(deleteDoc(ref)).pipe(
                catchError((err) => {
                    console.error('Error during deleting query!', err);
                    return EMPTY;
                })
            )),
            first()
        );
    }
}