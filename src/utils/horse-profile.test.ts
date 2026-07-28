import {
    buildChangedHorsePayload,
    hasAppointmentFieldChanged,
    shouldSyncAppointment,
} from './horse-profile';

describe('horse profile changes', () => {
    it('includes notes when a new horse profile is saved for the first time', () => {
        const current = {
            horse_name: 'Bramble',
            worming_notes: 'Used product A',
            saddle_fitter_notes: 'Check again in six months',
            physio_notes: 'Left shoulder was tight',
            farrier_notes: 'Front shoes replaced',
            dentist_notes: 'Routine rasp completed',
            feed_instructions: 'Two feeds per day',
            horse_behaviours: 'Nervous around tractors',
            farrier_next_visit: '2026-08-10',
            user_uuid: 'user-1',
        };
        const original = Object.fromEntries(Object.keys(current).map((key) => [key, '']));
        const excludedFields = new Set(['farrier_next_visit', 'user_uuid']);

        expect(buildChangedHorsePayload(current, original, excludedFields)).toEqual({
            horse_name: 'Bramble',
            worming_notes: 'Used product A',
            saddle_fitter_notes: 'Check again in six months',
            physio_notes: 'Left shoulder was tight',
            farrier_notes: 'Front shoes replaced',
            dentist_notes: 'Routine rasp completed',
            feed_instructions: 'Two feeds per day',
            horse_behaviours: 'Nervous around tractors',
        });
    });

    it('syncs appointment notes when the date is unchanged', () => {
        expect(
            shouldSyncAppointment(
                '2026-08-10',
                '2026-08-10',
                'Updated farrier notes',
                'Original farrier notes'
            )
        ).toBe(true);
    });

    it('does not sync an unchanged appointment when another date is edited', () => {
        expect(
            shouldSyncAppointment(
                '2026-09-15',
                '2026-09-15',
                'Existing dentist notes',
                'Existing dentist notes'
            )
        ).toBe(false);
    });

    it('does not treat an insurance date edit as an appointment change', () => {
        expect(
            hasAppointmentFieldChanged(
                new Set(['insurance_date']),
                'farrier_next_visit',
                'farrier_notes'
            )
        ).toBe(false);
    });
});
