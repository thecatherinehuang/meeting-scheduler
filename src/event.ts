import { UserId } from "./user";

export type EventId = string;
export interface EventInterface {
    eventId: EventId;
    start: string;
    end: string;
    users: Array<UserId>;
    // preference: EventPreference;
    // eventType: EventType;
    // getDurationInMinutes(): number;
}

export class Event implements EventInterface {
    eventId: EventId;
    start: string;
    end: string;
    users: Array<UserId>;
    constructor({eventId, start, end, users}: {eventId: EventId, start: string, end: string, users: Array<UserId>}) {
        this.eventId = eventId;
        this.start = start;
        this.end = end;
        this.users = users;
    }
}

export enum EventType {
    social = "SOCIAL",
    work = "WORK",

}
export type EventPreference = {
    canBeMoved: boolean;
}