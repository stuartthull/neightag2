import { hasHorseCapacity } from './stable-capacity';

describe('stable capacity', () => {
    it.each([
        [0, 0, true],
        [1, 0, false],
        [1, 1, true],
        [2, 1, false],
        [2, 2, true],
        [3, 2, false],
        [3, 3, true],
        [4, 3, false],
    ])(
        'with %i horses and %i active subscriptions, capacity is %s',
        (horseCount, activeSubscriptionCount, expected) => {
            expect(hasHorseCapacity(horseCount, activeSubscriptionCount)).toBe(expected);
        }
    );
});
