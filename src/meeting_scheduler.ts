import { Interval, IntervalWithMetadata } from './interval';
import { User, UserId } from './user';
import { Event, EventId } from './event';
import { combineEvents, findAllAvailableIntervals, intersectAvailabilities } from './interval_helpers';
import { addMinutes, format, formatDate, formatISO, isAfter, isBefore, parseISO, setMilliseconds, setSeconds, startOfMinute } from 'date-fns';
 
type Suggestion = {
    score: number;
    start: string;
}

// In order of importance
// 1. start on a multiple of 15 minutes
// 2. prefer consecutive meetings
// TODO: include the time starting from the end; didn't implement this because it's the same idea
function suggest15MinuteSlots(interval: Interval, duration: number): Array<Suggestion> {
    const {start, end} = interval;
    const startISO = parseISO(start);
    const endISO = parseISO(end);
    
    const roundedStart = roundUpToNext15(startISO);
    const result: Array<Suggestion> = [];
    
    let current = roundedStart;
    if (isAfter(addMinutes(current, duration), endISO)) {
        return [{
            score: -1,
            start: start,
        }];
    } else {
        result.push({
            score: 1,
            start: current.toISOString()
        })
        current = addMinutes(current, 15);
    }
    
    while (isBefore(addMinutes(current, duration), endISO)) {
        result.push({score: 0, start: current.toISOString()});
        current = addMinutes(current, 15);
    }
    return result;
}

function roundUpToNext15(date: Date): Date {
    const minutes = date.getMinutes();
    const remainder = minutes % 15;
    const diff = remainder === 0 ? 0 : 15 - remainder;
  
    const rounded = addMinutes(date, diff);
    return setSeconds(rounded, 0);
  }

// order meeting times; prefer earlier times
export function getMeetingTimes(availableIntervals: Array<Interval>, duration: number): Array<string> {
    availableIntervals.sort((a, b) => {
        return a.start < b.start ? -1 : 1;
    })

    const possibleStartTimes = availableIntervals.flatMap((interval) => suggest15MinuteSlots(interval, duration));
    // sort by score first, then early 
    possibleStartTimes.sort((sugg1, sugg2) => {
        if (sugg1.score !== sugg2.score) {
            return sugg2.score - sugg1.score; // higher score first 
        }
        return sugg1.start < sugg2.start ? -1 : 1;
    })
    return possibleStartTimes.map((sugg) => {return sugg.start;});
}

export function findAvailableSlots(
    usersByUserId: Record<UserId, User>, 
    eventsByUserId: Record<UserId, Array<Event>>, 
    duration: number, 
    allowReschedule: boolean, 
    timeRange: Array<Interval>
): {msg: string, startTimes: Array<string>} {
    const eventsByEventId: Record<EventId, Event> = {};
    for (const event of Object.values(eventsByUserId).flat()) {
        eventsByEventId[event.eventId] = event;
    }

    const schedules = Object.values(eventsByUserId);
    for (let i = 0; i < schedules.length; i++) {
        combineEvents(schedules[i]);
    } 

    // This metadata can be consumed 
    const blockedTimeIntervals: Array<IntervalWithMetadata> = combineEvents(schedules.flat()); 
    const availabilityConstraints = Object.values(usersByUserId).map((user: User) => user.preferredHours);
    availabilityConstraints.push(timeRange);
    const availabilityBasedOnPreferences =  intersectAvailabilities(availabilityConstraints);
    const availableIntervals = findAllAvailableIntervals(blockedTimeIntervals, availabilityBasedOnPreferences);
    const filteredIntervals = availableIntervals.filter((interval) => {
        return interval.getDurationInMinutes() >= duration;
    })
    const orderedMeetingStartTimes = getMeetingTimes(filteredIntervals, duration);
   
    if (orderedMeetingStartTimes.length > 0) {
        return {msg: "Found some times", startTimes: orderedMeetingStartTimes.slice(0, 5)};
    }
    
    if (!allowReschedule) {
        return {msg: "Unable to find time without rescheduling some events", 
            startTimes: [],
        };
    }
    return {msg: "not yet implemented", startTimes: []}
}

