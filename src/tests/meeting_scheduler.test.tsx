import { describe, it, expect } from 'vitest';
import { Interval} from '../interval';
import { UserId, User } from '../user';
import { Event} from '../event';
import { findAvailableSlots } from '../meeting_scheduler';

describe('testing main function', () => {
    const usersByUserId: Record<UserId, User> = {
        'a': new User({userId: "a", eventIds: ["1", "2", "3"], preferredHours: [new Interval("2023-10-17T00:00:00Z", "2023-10-17T23:59:00Z")]}),
        'b': new User({userId: "b", eventIds: ["4", "5", "6", "7"], preferredHours: [new Interval("2023-10-17T07:30:00Z", "2023-10-17T14:30:00Z")]}),
        'c': new User({userId: "c", eventIds: ["4", "8", "9"], preferredHours: [new Interval("2023-10-17T00:00:00Z", "2023-10-17T23:59:00Z")]}),
    }
    
    const eventsByUserId: Record<UserId, Array<Event>> = {
        "a": [
            new Event({eventId: "1", start: "2023-10-17T09:00:00Z", end: "2023-10-17T10:30:00Z", users: ["a"]}), 
            new Event({eventId: "2", start: "2023-10-17T12:00:00Z", end: "2023-10-17T13:00:00Z", users: ["a", "d"]}), 
            new Event({eventId: "3", start: "2023-10-17T16:00:00Z", end: "2023-10-17T18:00:00Z", users: ["a"]})],
        "b": [
            new Event({eventId: "4", start: "2023-10-17T10:00:00Z", end: "2023-10-17T11:30:00Z", users: ["b", "c"]}),
            new Event({eventId: "5", start: "2023-10-17T12:30:00Z", end: "2023-10-17T14:30:00Z", users: ["b"]}), 
            new Event({eventId: "6", start: "2023-10-17T14:30:00Z", end: "2023-10-17T15:00:00Z", users: ["b"]}), 
            new Event({eventId: "7", start: "2023-10-17T16:00:00Z", end: "2023-10-17T17:00:00Z", users: ["b"]})], 
        "c": [
            new Event({eventId: "4", start: "2023-10-17T10:00:00Z", end: "2023-10-17T11:30:00Z", users: ["b", "c"]}),
            new Event({eventId: "8", start: "2023-10-17T12:00:00Z", end: "2023-10-17T13:30:00Z", users: ["c"]}), 
            new Event({eventId: "9", start: "2023-10-17T14:00:00Z", end: "2023-10-17T16:30:00Z", users: ["c", "d"]})]
    }
    const duration = 30;
    const timeRange = [new Interval("2023-10-17T00:00:00Z", "2023-10-17T23:59:00Z")];

    it('canonical example duration 30 mins', () => {
        const result = findAvailableSlots(usersByUserId, eventsByUserId, duration, false, timeRange);
        expect(result.startTimes[0]).toEqual("2023-10-17T07:30:00.000Z");
        expect(result.startTimes[1]).toEqual("2023-10-17T11:30:00.000Z");
        expect(result.startTimes.length).toEqual(5);
    });

    it('canonical example duration 2 hrs', () => {
        const result = findAvailableSlots(usersByUserId, eventsByUserId, 120, false, timeRange);
        expect(result.startTimes).toEqual(["2023-10-17T11:30:00.000Z","2023-10-17T11:45:00.000Z","2023-10-17T12:00:00.000Z","2023-10-17T12:15:00.000Z"]);
    });
});
