"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Unit tests for interval_helpers 
const vitest_1 = require("vitest");
const interval_1 = require("../interval");
const interval_helpers_1 = require("../interval_helpers");
(0, vitest_1.describe)('intersectManySorted', () => {
    (0, vitest_1.it)('intersect two intervals correctly', () => {
        const interval1 = new interval_1.Interval("1", "2");
        const interval2 = new interval_1.Interval("0", "15");
        const interval3 = new interval_1.Interval("3", "5");
        const interval4 = new interval_1.Interval("15", "3");
        const interval5 = new interval_1.Interval("15", "16");
        const interval6 = new interval_1.Interval("0", "1");
        (0, vitest_1.expect)((0, interval_helpers_1._intersectAvailability)(interval1, interval2)).toEqual(new interval_1.Interval("1", "15"));
        (0, vitest_1.expect)((0, interval_helpers_1._intersectAvailability)(interval1, interval3)).toEqual(null);
        (0, vitest_1.expect)((0, interval_helpers_1._intersectAvailability)(interval1, interval4)).toEqual(new interval_1.Interval("15", "2"));
        (0, vitest_1.expect)((0, interval_helpers_1._intersectAvailability)(interval1, interval5)).toEqual(new interval_1.Interval("15", "16"));
        (0, vitest_1.expect)((0, interval_helpers_1._intersectAvailability)(interval1, interval6)).toEqual(null);
    });
    (0, vitest_1.it)('intersect multiple intervals between two schedules correctly', () => {
        const user1Availability = [new interval_1.Interval("3", "5"), new interval_1.Interval("7", "9")];
        const user2Availability = [new interval_1.Interval("0", "2"), new interval_1.Interval("23", "31"), new interval_1.Interval("45", "71"), new interval_1.Interval("76", "9"), new interval_1.Interval("93", "95")];
        (0, vitest_1.expect)((0, interval_helpers_1.intersectTwoAvailabilities)(user1Availability, user2Availability))
            .toEqual([new interval_1.Interval("3", "31"), new interval_1.Interval("45", "5"), new interval_1.Interval("7", "71"), new interval_1.Interval("76", "9")]);
    });
    (0, vitest_1.it)('intersects multiple intervals between multiple schedules correctly', () => {
        const user1Availability = [new interval_1.Interval("3", "5"), new interval_1.Interval("7", "9")];
        const user2Availability = [new interval_1.Interval("0", "2"), new interval_1.Interval("23", "31"), new interval_1.Interval("45", "71"), new interval_1.Interval("76", "9"), new interval_1.Interval("93", "95")];
        const user3Availability = [new interval_1.Interval("0", "45"), new interval_1.Interval("6", "77"), new interval_1.Interval("9", "95")];
        (0, vitest_1.expect)((0, interval_helpers_1.intersectAvailabilities)([user1Availability, user2Availability, user3Availability]))
            .toEqual([new interval_1.Interval("3", "31"), new interval_1.Interval("7", "71"), new interval_1.Interval("76", "77")]);
    });
});
//# sourceMappingURL=interval_helper_tests.test.js.map