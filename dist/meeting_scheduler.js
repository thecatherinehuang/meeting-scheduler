"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMeetingTimes = getMeetingTimes;
exports.findAvailableSlots = findAvailableSlots;
const interval_1 = require("./interval");
const user_1 = require("./user");
const event_1 = require("./event");
const interval_helpers_1 = require("./interval_helpers");
const date_fns_1 = require("date-fns");
// In order of importance
// 1. start on a multiple of 15 minutes
// 2. prefer consecutive meetings
// TODO: include the time starting from the end; didn't implement this because it's the same idea
function suggest15MinuteSlots(interval, duration) {
    const { start, end } = interval;
    const startISO = (0, date_fns_1.parseISO)(start);
    const endISO = (0, date_fns_1.parseISO)(end);
    const roundedStart = roundUpToNext15(startISO);
    const result = [];
    let current = roundedStart;
    console.log(`roundedStart: ${roundedStart.toISOString()}`);
    if ((0, date_fns_1.isAfter)((0, date_fns_1.addMinutes)(current, duration), endISO)) {
        return [{
                score: -1,
                start: start,
            }];
    }
    else {
        result.push({
            score: 1,
            start: current.toISOString()
        });
        current = (0, date_fns_1.addMinutes)(current, 60);
    }
    while ((0, date_fns_1.isBefore)((0, date_fns_1.addMinutes)(current, duration), endISO)) {
        result.push({ score: 0, start: current.toISOString() });
        current = (0, date_fns_1.addMinutes)(current, 60);
    }
    console.log(`result: ${JSON.stringify(result)}`);
    return result;
}
// function roundUpToNext15(date: Date): Date {
//     const minutes = date.getMinutes();
//     const next15 = Math.ceil(minutes / 60) * 60;
//     // const rounded = startOfMinute(setSeconds(setMilliseconds(date, 0), 0));
//     return addMinutes(date, next15);
// }
function roundUpToNext15(date) {
    const minutes = date.getMinutes();
    const remainder = minutes % 15;
    const diff = remainder === 0 ? 0 : 15 - remainder;
    const rounded = (0, date_fns_1.addMinutes)(date, diff);
    return (0, date_fns_1.setMilliseconds)((0, date_fns_1.setSeconds)(rounded, 0), 0);
}
// order meeting times; prefer earlier times
function getMeetingTimes(availableIntervals, duration) {
    availableIntervals.sort((a, b) => {
        return a.start < b.start ? -1 : 1;
    });
    const possibleStartTimes = availableIntervals.flatMap((interval) => suggest15MinuteSlots(interval, duration));
    console.log(`possibleStartTimes: ${JSON.stringify(possibleStartTimes)}`);
    // sort by score first, then early 
    possibleStartTimes.sort((sugg1, sugg2) => {
        if (sugg1.score !== sugg2.score) {
            return sugg2.score - sugg1.score; // higher score first 
        }
        return sugg1.start < sugg2.start ? -1 : 1;
    });
    return possibleStartTimes.map((sugg) => { return sugg.start; });
}
function findAvailableSlots(usersByUserId, eventsByUserId, duration, allowReschedule, timeRange) {
    const eventsByEventId = {};
    for (const event of Object.values(eventsByUserId).flat()) {
        eventsByEventId[event.eventId] = event;
    }
    const schedules = Object.values(eventsByUserId);
    for (let i = 0; i < schedules.length; i++) {
        (0, interval_helpers_1.combineEvents)(schedules[i]);
    }
    // This metadata can be consumed 
    const blockedTimeIntervals = (0, interval_helpers_1.combineEvents)(schedules.flat());
    const availabilityConstraints = Object.values(usersByUserId).map((user) => user.preferredHours);
    availabilityConstraints.push(timeRange);
    const availabilityBasedOnPreferences = (0, interval_helpers_1.intersectAvailabilities)(availabilityConstraints);
    const availableIntervals = (0, interval_helpers_1.findAllAvailableIntervals)(blockedTimeIntervals, availabilityBasedOnPreferences);
    console.log(`availableIntervals: ${JSON.stringify(availableIntervals)}`);
    process.stdout.write('');
    availableIntervals.filter((interval) => {
        interval.getDurationInMinutes() >= duration;
    });
    const orderedMeetingStartTimes = getMeetingTimes(availableIntervals, duration);
    console.log(`orderedMeetingStartTimes: ${orderedMeetingStartTimes}`);
    if (orderedMeetingStartTimes.length > 0) {
        return { msg: "Found some times", startTimes: orderedMeetingStartTimes.slice(0, 5) };
    }
    if (!allowReschedule) {
        return { msg: "Unable to find time without rescheduling some events",
            startTimes: [],
        };
    }
    return { msg: "not yet implemented", startTimes: [] };
}
const usersByUserId = {
    'a': new user_1.User({ userId: "a", eventIds: ["1", "2", "3"], preferredHours: [new interval_1.Interval("2023-10-17T00:00:00Z", "2023-10-17T23:59:00Z")] }),
    'b': new user_1.User({ userId: "b", eventIds: ["4", "5", "6", "7"], preferredHours: [new interval_1.Interval("2023-10-17T00:00:00Z", "2023-10-17T23:59:00Z")] }),
    'c': new user_1.User({ userId: "c", eventIds: ["4", "8", "9"], preferredHours: [new interval_1.Interval("2023-10-17T00:00:00Z", "2023-10-17T23:59:00Z")] }),
};
const eventsByUserId = {
    "a": [
        new event_1.Event({ eventId: "1", start: "2023-10-17T09:00:00Z", end: "2023-10-17T10:30:00Z", users: ["a"] }),
        new event_1.Event({ eventId: "2", start: "2023-10-17T12:00:00Z", end: "2023-10-17T13:00:00Z", users: ["a", "d"] }),
        new event_1.Event({ eventId: "3", start: "2023-10-17T16:00:00Z", end: "2023-10-17T18:00:00Z", users: ["a"] })
    ],
    "b": [
        new event_1.Event({ eventId: "4", start: "2023-10-17T10:00:00Z", end: "2023-10-17T11:30:00Z", users: ["b", "c"] }),
        new event_1.Event({ eventId: "5", start: "2023-10-17T12:30:00Z", end: "2023-10-17T14:30:00Z", users: ["b"] }),
        new event_1.Event({ eventId: "6", start: "2023-10-17T14:30:00Z", end: "2023-10-17T15:00:00Z", users: ["b"] }),
        new event_1.Event({ eventId: "7", start: "2023-10-17T16:00:00Z", end: "2023-10-17T17:00:00Z", users: ["b"] })
    ],
    "c": [
        new event_1.Event({ eventId: "4", start: "2023-10-17T10:00:00Z", end: "2023-10-17T11:30:00Z", users: ["b", "c"] }),
        new event_1.Event({ eventId: "8", start: "2023-10-17T12:00:00Z", end: "2023-10-17T13:30:00Z", users: ["c"] }),
        new event_1.Event({ eventId: "9", start: "2023-10-17T14:00:00Z", end: "2023-10-17T16:30:00Z", users: ["c", "d"] })
    ]
};
const duration = 30;
const timeRange = [new interval_1.Interval("2023-10-17T00:00:00Z", "2023-10-17T23:59:00Z")];
const result = findAvailableSlots(usersByUserId, eventsByUserId, duration, false, timeRange);
console.log(`result: ${JSON.stringify(result)}`);
//# sourceMappingURL=meeting_scheduler.js.map