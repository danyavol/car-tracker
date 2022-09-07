import { Query } from "../interfaces/query.interface";
import { User } from "../interfaces/user.interface";

export const allUsers: User[] = [];

export const allQueries: Query[] = [];

export const timersMap = new Map<string, NodeJS.Timeout>();