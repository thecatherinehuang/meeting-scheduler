import { EventId } from "./event";
import { Interval } from "./interval";

export interface UserInterface {
    userId: UserId;
    eventIds: Array<EventId>;
    preferredHours: Array<Interval>;
}

export class User implements UserInterface {
    userId: UserId;
    eventIds: Array<EventId>;
    preferredHours: Array<Interval>;
    constructor({userId, eventIds, preferredHours}: {userId: UserId; eventIds: Array<EventId>; preferredHours: Array<Interval>}) {
        this.userId = userId;
        this.eventIds = eventIds;
        this.preferredHours = preferredHours;
    } 
}

/// Assumed to be unique. 
export type UserId = string;
