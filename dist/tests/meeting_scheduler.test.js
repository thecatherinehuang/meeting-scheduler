"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const interval_1 = require("../interval");
const user_1 = require("../user");
const event_1 = require("../event");
const meeting_scheduler_1 = require("../meeting_scheduler");
const interval_helpers_1 = require("../interval_helpers");
(0, vitest_1.describe)('testing main function', () => {
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
    vitest_1.it.skip('find available slots', () => {
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
        console.log(availabilityBasedOnPreferences);
        const availableIntervals = (0, interval_helpers_1.findAllAvailableIntervals)(blockedTimeIntervals, availabilityBasedOnPreferences);
        console.log(`availableIntervals: ${JSON.stringify(availableIntervals)}`);
        availableIntervals.filter((interval) => {
            interval.getDurationInMinutes() >= duration;
        });
        console.log(`filteredIntervals: ${JSON.stringify(availableIntervals)}`);
        const orderedMeetingStartTimes = (0, meeting_scheduler_1.getMeetingTimes)(availableIntervals, duration);
        console.log(`orderedMeetingStartTimes: ${orderedMeetingStartTimes}`);
        // if (orderedMeetingStartTimes.length > 0) {
        //     return {msg: "Found some times", startTimes: orderedMeetingStartTimes.slice(0, 5)};
        // }
    });
    // if (!allowReschedule) {
    //     return {msg: "Unable to find time without rescheduling some events", 
    //         startTimes: [],
    //     };
    // }
    // return {msg: "not yet implemented", startTimes: []}
    // })
    (0, vitest_1.it)('canonical example', () => {
        const result = (0, meeting_scheduler_1.findAvailableSlots)(usersByUserId, eventsByUserId, duration, false, timeRange);
        console.log(JSON.stringify(result));
    });
});
//# sourceMappingURL=meeting_scheduler.test.js.map