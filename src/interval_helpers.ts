import { Interval, IntervalWithMetadata } from "./interval";
import { Event } from "./event";

export function findAllAvailableIntervals(unavailableTime: Array<Interval>, validTimes: Array<Interval>) {
    unavailableTime.sort((a, b) => a.start < b.start ? -1 : 1 );
    const availableIntervals: Array<Interval> = [];
    let i = 0; // index for unavailableTime
    for (const {start: validStart, end: validEnd} of validTimes) {
        let currStart = validStart; 
        while (i < unavailableTime.length && unavailableTime[i].end < currStart)  {
            i++;
        }

        while (i < unavailableTime.length && unavailableTime[i]) {
            let {start: unavailableStart, end: unavailableEnd} = unavailableTime[i];  
            // If there's a free interval before the unavailable interval
            if (unavailableStart > currStart) {
                availableIntervals.push(new Interval(currStart, unavailableStart < validEnd ? unavailableStart : validEnd));
            } else {
                break;
            }

            currStart = currStart > unavailableEnd ? currStart : unavailableEnd;
        }

        // If there is a free interval after the unavailable interval
        if (currStart < validEnd) {
            availableIntervals.push(new Interval(currStart, validEnd));
        }
    }
    return availableIntervals;
}

/// Sort intervals in place and combine intervals
export function combineEvents(events: Array<Event>): Array<IntervalWithMetadata> {
    // sort by start time
    // supposed to return negative value if first argument is less than second argument
    events.sort((a, b) => a.start < b.start ? -1 : 1);
    if (events.length <= 1) {
        const interval: Array<IntervalWithMetadata> = events.map((event: Event) => new IntervalWithMetadata(event));
        return interval;
    }

    const unavailableTime: Array<IntervalWithMetadata> = [new IntervalWithMetadata(events[0])];
    let lastEnd = events[0].end;
    for (let i = 1; i < events.length; i++) {
        const currEvent = events[i]
        const {start: currStart, end: currEnd} = currEvent;
        if (currStart < lastEnd) {
            unavailableTime[unavailableTime.length - 1].combine(currEvent);
            lastEnd = currEnd > lastEnd ? currEnd : lastEnd;
        } else {
            unavailableTime.push(new IntervalWithMetadata(currEvent));
            lastEnd = currEnd;
        }
    }
    return unavailableTime;
}

export function intersectAvailabilities(userPreferences: Array<Array<Interval>>): Array<Interval> {
    if (userPreferences.length === 0) return [];
    return userPreferences.reduce((acc, curr) => intersectTwoAvailabilities(acc, curr));
}

/// Complexity O(m + n)
// helpful to merge user availabilities 
export function intersectTwoAvailabilities(user1Availability: Array<Interval>, user2Availability: Array<Interval>): Array<Interval> {
    // NOCOMMIT ensure sort 
    // userAvailability.push(intervalToFindTime);
    // sort availabilitys, ensure intervals merged
    let result: Array<Interval> = []
    let j = 0;
    for (let i = 0; i < user1Availability.length; i+=1) {
        const {start: start1, end: end1} = user1Availability[i];
        while (j < user2Availability.length) { 
            let {start: start2, end: end2} = user2Availability[j];
            if (start2 >= end1) {
                break;
            }
            const maybeInterval = _intersectAvailability(user1Availability[i], user2Availability[j]);
            if (maybeInterval) {
                result.push(maybeInterval);
            } 

            // move the pointer depending on which end is larger 
            if (end2 < end1) {
                j++; 
            } else {
                break;
            }
        }
    }
    return result;
}

export function _intersectAvailability(interval1: Interval, interval2: Interval): Interval | null {
    if (interval1.start > interval2.start) {
        [interval1, interval2] = [interval2, interval1];
    }

    if (interval2.start >= interval1.end) {
        return null;
    }

    return new Interval(interval2.start, interval1.end > interval2.end ? interval2.end : interval1.end);
}
