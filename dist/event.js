"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventType = exports.Event = void 0;
class Event {
    constructor({ eventId, start, end, users }) {
        this.eventId = eventId;
        this.start = start;
        this.end = end;
        this.users = users;
    }
}
exports.Event = Event;
var EventType;
(function (EventType) {
    EventType["social"] = "SOCIAL";
    EventType["work"] = "WORK";
})(EventType || (exports.EventType = EventType = {}));
//# sourceMappingURL=event.js.map