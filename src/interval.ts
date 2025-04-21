import { differenceInMinutes, parseISO } from 'date-fns';
import {Event} from './event';
import { UserId } from './user';

// export type Interval = Pick<Event, 'start' | 'end'>;
export interface IntervalInterface {
    start: string;
    end: string;
    getDurationInMinutes(): number;
}

export class Interval implements IntervalInterface {
    start: string;
    end: string;
    constructor(start: string, end: string) {
        this.start = start;
        this.end = end
    }
    getDurationInMinutes(): number {
        return differenceInMinutes(parseISO(this.end), parseISO(this.start));
    }
}

export interface ReschedulingPlan {
    schedules: Record<UserId, Array<Interval>>

}
export interface IntervalWithMetadataInterface {
    start: string;
    end: string;
    startEvents: Array<Event>;
    endEvents: Array<Event>;
    events: Array<Event>;
    // only call this combine function if the intervals are consecutive and 
    combine(event: Event): void;
    getDurationInMinutes(): number;
    getEventsAtStartOfInterval(): Array<Event>;
    getEventsAtEndOfInterval(): Array<Event>;
}

export class IntervalWithMetadata implements IntervalWithMetadataInterface {
    start: string;
    end: string;
    startEvents: Array<Event>;
    endEvents: Array<Event>;
    events: Array<Event>;
    constructor(event: Event) {
        this.start = event.start;
        this.end = event.end;
        this.startEvents = [event];
        this.endEvents = [event];
        this.events = [event];
    }
    combine(event: Event) {
        const {start: currStart, end: currEnd} = event;
        if (currStart < this.start || currStart > this.end) {
            throw new Error("invalid start value; intervals cannot be combined");
        }

        if (currStart === this.start) {
            this.startEvents.push(event);
        }
        if (currEnd === this.end) {
            this.endEvents.push(event);
        }

        if (currEnd > this.end) {
            this.end = currEnd;
            this.endEvents = [event];
        }

        this.events.push(event);
    }
    getDurationInMinutes(): number {
        return differenceInMinutes(parseISO(this.start), parseISO(this.end));
    }
    getEventsAtStartOfInterval(): Array<Event> {
        return this.startEvents;
    }
    getEventsAtEndOfInterval(): Array<Event> {
        return this.endEvents;
    }
}
