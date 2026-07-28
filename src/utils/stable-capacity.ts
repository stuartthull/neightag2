export const hasHorseCapacity = (horseCount: number, activeSubscriptionCount: number) =>
    horseCount < activeSubscriptionCount + 1;
