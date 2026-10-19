CREATE OR REPLACE FUNCTION public.add_farrier_calendar_entry(
    target_horse_uuid uuid,
    appointment_date date,
    appointment_time time without time zone DEFAULT NULL,
    appointment_notes text DEFAULT ''
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    horse_owner_uuid uuid;
BEGIN
    SELECT horse.user_uuid
    INTO horse_owner_uuid
    FROM public.equi_log_main AS horse
    WHERE horse.horse_uuid = target_horse_uuid;

    IF horse_owner_uuid IS NULL THEN
        RAISE EXCEPTION 'Horse not found';
    END IF;

    INSERT INTO public.equi_calendar (
        user_uuid,
        horse_uuid,
        calendar_date,
        calendar_title,
        calendar_time,
        calendar_notes
    ) VALUES (
        horse_owner_uuid,
        target_horse_uuid,
        appointment_date,
        'Farrier Visit',
        appointment_time,
        COALESCE(appointment_notes, '')
    )
    ON CONFLICT (horse_uuid, calendar_title)
    DO UPDATE SET
        calendar_date = EXCLUDED.calendar_date,
        calendar_time = EXCLUDED.calendar_time,
        calendar_notes = EXCLUDED.calendar_notes;
END;
$$;

ALTER FUNCTION public.add_farrier_calendar_entry(uuid, date, time without time zone, text) OWNER TO postgres;
REVOKE ALL ON FUNCTION public.add_farrier_calendar_entry(uuid, date, time without time zone, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_farrier_calendar_entry(uuid, date, time without time zone, text) TO anon, authenticated, service_role;
