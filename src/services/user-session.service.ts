import { SessionData } from "src/interfaces/session.interface";

type UserId = number;

export const session = new Map<UserId, SessionData>();