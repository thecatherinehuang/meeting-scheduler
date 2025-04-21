"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntervalWithMetadata = exports.Interval = void 0;
const date_fns_1 = require("date-fns");
class Interval {
    constructor(start, end) {
        this.start = start;
        this.end = end;
    }
    getDurationInMinutes() {
        return (0, date_fns_1.differenceInMinutes)((0, date_fns_1.parseISO)(this.start), (0, date_fns_1.parseISO)(this.end));
    }
}
exports.Interval = Interval;
class IntervalWithMetadata {
    constructor(event) {
        this.start = event.start;
        this.end = event.end;
        this.startEvents = [event];
        this.endEvents = [event];
        this.events = [event];
    }
    combine(event) {
        const { start: currStart, end: currEnd } = event;
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
    getDurationInMinutes() {
        return (0, date_fns_1.differenceInMinutes)((0, date_fns_1.parseISO)(this.start), (0, date_fns_1.parseISO)(this.end));
    }
    getEventsAtStartOfInterval() {
        return this.startEvents;
    }
    getEventsAtEndOfInterval() {
        return this.endEvents;
    }
}
exports.IntervalWithMetadata = IntervalWithMetadata;
//# sourceMappingURL=interval.js.map