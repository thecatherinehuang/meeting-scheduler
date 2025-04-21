// Unit tests for interval_helpers 
import { describe, it, expect } from 'vitest';
import { Interval } from '../interval';
import { _intersectAvailability, intersectAvailabilities, intersectTwoAvailabilities } from '../interval_helpers';

describe('intersectManySorted', () => {
  it('intersect two intervals correctly', () => {
    const interval1 = new Interval("1", "2");
    const interval2 = new Interval("0", "15");
    const interval3 = new Interval("3", "5");
    const interval4 = new Interval("15", "3");
    const interval5 = new Interval("15", "16");
    const interval6 = new Interval("0", "1");

    expect(_intersectAvailability(interval1, interval2)).toEqual(new Interval("1", "15"));
    expect(_intersectAvailability(interval1, interval3)).toEqual(null);
    expect(_intersectAvailability(interval1, interval4)).toEqual(new Interval("15", "2"));
    expect(_intersectAvailability(interval1, interval5)).toEqual(new Interval("15", "16"));
    expect(_intersectAvailability(interval1, interval6)).toEqual(null);
  });

  it('intersect multiple intervals between two schedules correctly', () => {
    const user1Availability = [new Interval("3", "5"), new Interval("7", "9")];
    const user2Availability = [new Interval("0", "2"), new Interval("23", "31"), new Interval("45", "71"), new Interval("76", "9"), new Interval("93", "95")];
    expect(intersectTwoAvailabilities(user1Availability, user2Availability))
        .toEqual([new Interval("3", "31"), new Interval("45", "5"), new Interval("7", "71"), new Interval("76", "9")]);
  })

  it('intersects multiple intervals between multiple schedules correctly', () => {
    const user1Availability = [new Interval("3", "5"), new Interval("7", "9")];
    const user2Availability = [new Interval("0", "2"), new Interval("23", "31"), new Interval("45", "71"), new Interval("76", "9"), new Interval("93", "95")];
    const user3Availability = [new Interval("0", "45"), new Interval("6", "77"), new Interval("9", "95")];
    expect(intersectAvailabilities([user1Availability, user2Availability, user3Availability]))
        .toEqual([new Interval("3", "31"), new Interval("7", "71"), new Interval("76", "77")]);
  })
});
