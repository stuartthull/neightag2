export const buildChangedHorsePayload = (
    current: Record<string, unknown>,
    original: Record<string, unknown>,
    excludedFields: Set<string>
): Record<string, unknown> =>
    Object.keys(current).reduce<Record<string, unknown>>((payload, key) => {
        if (!excludedFields.has(key) && current[key] !== original[key]) {
            payload[key] = current[key] === '' ? null : current[key];
        }

        return payload;
    }, {});

export const shouldSyncAppointment = (
    newDate: string,
    oldDate: string,
    newNotes: unknown,
    oldNotes: unknown
): boolean => newDate !== oldDate || Boolean(newDate && newNotes !== oldNotes);
