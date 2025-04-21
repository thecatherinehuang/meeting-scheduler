# Meeting Scheduler 

The way I envision this sort of functionality to be used in a system is  `findAvailableSlots(timeFrame: Interval, users: Array<UserId>, duration: number)` where timeFrame is the period of time in which we are trying to schedule a time. We would then query for the relevant schedules for the attendees of the event and retrieve their preferences. As such, I'm passing in the `timeFrame` variable and am assuming some other part of the system is responsible for determining that value. 

I spent quite a bit of time thinking through the model schema to ensure that the system could be extensible to new features such as rescheduling amongst the users involved within this event. Unfortunately, I ran out of time to actually implement this feature. I've included an `Extensions` section in this write up to include all the features that I had in mind while designing the interfaces but didn't get to. 

I had fun and I wish I had more time to finish building it out!

# How to run this
```
npm test; // run all tests
```

# Solution 
## Interfaces 
Event: Used to define event preferences; event.ts
Interval: Basic start and end; interval.ts
IntervalWithMetadata: Used in determining how rescheduling could be helpful; interval.ts
User: Used to define user preferences and associated eventIds; user.ts

## Functions, what they do, and why they exist
### `combineEvents(events: Array<Event>): Array<IntervalWithMetadata>` 
- take a list of events and union intervals so that we are left with disjoint intervals
- the return time is more complicated than needed in the current implemented functionality, 
but the original plan was to use this metadata to help us with rescheduling some events 
if there were no available intervals. The proposed algorithm for rescheduling will be 
described in the `Extensions` section below. 
- space complexity: O(n); I initially wrote an algorithm that did the combining in place, but 
we sometimes need to tradeoff space efficiency for readability in code. Functions that have side effects like reordering the input are often hard to track and are not good building blocks to build off of. It's also unlikelly that space would be a limitation due to the small inputs.
- time complexity: O(n log n) for the sort in the beginning.
### `intersectAvailabilities(userPreferences: Array<Array<Interval>>): Array<Interval>`
- in the absence of any events, this function gives us the intervals at which the users 
are free to meet according to their preferences. 
- the reason for separating this function out from the core algorithm is so that given an
event, we can check if rescheduling it would help with availability.
### `getMeetingTimes(availableIntervals: Array<Interval>, duration: number): Array<string>`
- this function takes the valid intervals and required durations and returns a list of 
start times for the meeting
- it was important to me to separate this out from the correctness portion to allow 
for customizing the suggestions to user preferences.

# Extensions
Here are some miscellaneous ways we could allow for more preferences:
- Specific preferred hours by activity type then day
- Preference for back-to-back meetings
- Specify if an event can be moved
- Specify if users allow for moving events
- Specify how much in advance to schedule a meeting 

How to implement rescheduling? 
- Find all events that involve only people from the event to be scheduled.
- If there exists an event that is longer than the current 
- Check to see if that event falls in the time period where everyone is available
- Check to see if rescheduling that event would make the event possible 
    - either the moved event(s) is longer than the duration we want OR 
    - the moved event(s) are on the border of an interval (tracked with IntervalWithMetadata!)
- Check if we can reschedule that event. The sketch for how we can do this:
    - call findAvailableSlots() with a different set of arguments and allowReschedule = false
    - for eventsByUserId, we would add the guess for a valid time (can have multiple guesses here) as an event and remove the event(s) we are trying to reschedule in this object
    - if we are able to successfully reschedule the other events, then the meeting has been successfully scheduled with reshuffling of meetings of people only within the group! 
