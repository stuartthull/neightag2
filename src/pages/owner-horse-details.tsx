import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { formatGBDate } from '../utils/date-format';
import { Helmet } from 'react-helmet-async';

export default function OwnerHorseDetails(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const navigate = useNavigate();
    const [horse, setHorse] = useState<any>(null);
    const [calendarMap, setCalendarMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const dataEngine = async () => {
            try {
                if (!horse_uuid) {
                    console.error('Missing Horse UUID parameter context.');
                    navigate('/');
                    return;
                }

                const {
                    data: { user },
                } = await supabase.auth.getUser();
                if (!user) {
                    navigate('/login');
                    return;
                }

                const { data: horseData, error: horseError } = await supabase
                    .from('equi_log_main')
                    .select('*')
                    .eq('horse_uuid', horse_uuid)
                    .eq('user_uuid', user.id)
                    .single();

                if (horseError || !horseData) {
                    console.error('Database lookup failed:', horseError?.message);
                    alert(`This record does not exist or cannot be reached.`);
                    navigate('/');
                    return;
                }

                const { data: calendarData } = await supabase
                    .from('equi_calendar')
                    .select('calendar_title, calendar_date')
                    .eq('horse_uuid', horse_uuid)
                    .eq('user_uuid', user.id);

                const scheduleLookups: Record<string, string> = {};
                if (calendarData) {
                    calendarData.forEach((item: any) => {
                        if (item.calendar_title && item.calendar_date) {
                            scheduleLookups[item.calendar_title] = String(item.calendar_date).split(
                                'T'
                            )[0];
                        }
                    });
                }

                setHorse(horseData);
                setCalendarMap(scheduleLookups);
            } catch (err) {
                console.error('Error processing administrative records:', err);
            } finally {
                setLoading(false);
            }
        };
        dataEngine();
    }, [horse_uuid, navigate]);

    if (loading)
        return (
            <div className="page-wrapper">
                <div className="page-container">
                    <section className="section-container purple-section-container">
                        <div className="loading">LOADING: Accessing Master Asset Records...</div>
                    </section>
                </div>
            </div>
        );

    if (!horse) {
        return (
            <main className="page-wrapper">
                <div className="page-container">
                    <section className="section-container white-section-container">
                        <h1 className="textbig">Horse record unavailable</h1>
                        <p className="text-normal marginbsixteen">
                            This horse record could not be loaded.
                        </p>
                        <button
                            type="button"
                            onClick={() => navigate('/dashboard')}
                            className="buttonMain buttonPurple"
                        >
                            Back to Your Stable
                        </button>
                    </section>
                </div>
            </main>
        );
    }

    const saddleFitterDate = calendarMap['Saddle Fitter Visit']
        ? formatGBDate(calendarMap['Saddle Fitter Visit'])
        : 'TBC';
    const physioDate = calendarMap['Physio Visit']
        ? formatGBDate(calendarMap['Physio Visit'])
        : 'TBC';
    const farrierDate = calendarMap['Farrier Visit']
        ? formatGBDate(calendarMap['Farrier Visit'])
        : 'TBC';
    const dentistDate = calendarMap['Dentist Visit']
        ? formatGBDate(calendarMap['Dentist Visit'])
        : 'TBC';
    // 💡 Resolve the newly structured worming date parameters
    const wormingDate = calendarMap['Worming Due']
        ? formatGBDate(calendarMap['Worming Due'])
        : 'TBC';

    return (
        <main className="page-wrapper">
            <Helmet>
                <title>{`Administrative Console | ${horse.horse_name}`}</title>
            </Helmet>
            <div className="page-container">
                <div className="alert-banner-warning">
                    ⚙️ <strong>Your Full Record View</strong>
                    <br />
                    This is your full administrative view of this horse's record. You can view all
                    details, but you cannot edit them here. To make changes, please use the "Edit
                    Horse Record" option in your dashboard.
                </div>

                <section className="section-container purple-section-container">
                    <button
                        type="button"
                        onClick={() => navigate('/dashboard')}
                        className="buttonWhite buttonMain marginbsixteen"
                    >
                        ← Back to Your Stable
                    </button>
                    <h1 className="textbig marginbeight">
                        <strong>{horse.horse_name}'s</strong> Console
                    </h1>
                    {horse.horse_image_url && (
                        <div className="horse-profile-image-wrapper">
                            <img
                                src={horse.horse_image_url}
                                alt={horse.horse_name}
                                className="horse-profile-image"
                                style={{
                                    width: '200px',
                                    height: '200px',
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    margin: '0 auto 16px',
                                }}
                            />
                        </div>
                    )}
                </section>

                <section className="section-container white-section-container">
                    <h2 className="textbig">Emergency Contacts</h2>
                    <div className="horsebox-panel breakdown-panel">
                        <p className="text-normal">
                            <strong>Primary Contact:</strong>
                        </p>
                        <p className="text-normal marginbsixteen">
                            {horse.emergency_name_one || 'Not Set'}
                        </p>
                        <p className="text-normal">
                            <a
                                href={`tel:${horse.emergency_phone_one}`}
                                className="buttonMain buttonOrange"
                            >
                                📞 {horse.emergency_phone_one || 'Not Set'}
                            </a>
                        </p>
                    </div>
                    <div className="horsebox-panel breakdown-panel">
                        <p className="text-normal">
                            <strong>Secondary Contact:</strong>
                        </p>
                        <p className="text-normal marginbsixteen">
                            {horse.emergency_name_two || 'Not Set'}
                        </p>
                        <p className="text-normal">
                            <a
                                href={`tel:${horse.emergency_phone_two}`}
                                className="buttonMain buttonOrange"
                            >
                                📞 {horse.emergency_phone_two || 'Not Set'}
                            </a>
                        </p>
                    </div>
                    <div className="horsebox-panel breakdown-panel">
                        <p className="text-normal">
                            <strong>Third Contact:</strong>
                        </p>
                        <p className="text-normal marginbsixteen">
                            {horse.emergency_name_three || 'Not Set'}
                        </p>
                        <p className="text-normal">
                            <a
                                href={`tel:${horse.emergency_phone_three}`}
                                className="buttonMain buttonOrange"
                            >
                                📞 {horse.emergency_phone_three || 'Not Set'}
                            </a>
                        </p>
                    </div>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium marginbsixteen">Identity & Parameters</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Breed:</span> <strong>{horse.horse_breed || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Color:</span> <strong>{horse.horse_colour || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Date of Birth:</span>{' '}
                        <strong>{horse.horse_dob ? formatGBDate(horse.horse_dob) : 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Passport Number:</span>{' '}
                        <strong>{horse.horse_passport_number || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Height:</span> <strong>{horse.horse_height || 'N/A'} hh</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Current Weight:</span>{' '}
                        <strong>{horse.horse_weight_kg || '--'} kg</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Last Weighed:</span>{' '}
                        <strong>
                            {horse.horse_last_weighed
                                ? formatGBDate(horse.horse_last_weighed)
                                : 'N/A'}
                        </strong>
                    </div>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium">Horse Insurance Details</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Insurer Name:</span>{' '}
                        <strong>{horse.insurance_provider || 'Not documented'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Policy Number:</span>{' '}
                        <strong>{horse.insurance_policy_number || 'Not documented'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Renewal Date:</span>{' '}
                        <strong>
                            {horse.insurance_date ? formatGBDate(horse.insurance_date) : 'Not Set'}
                        </strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Claims Phone:</span>{' '}
                        <strong>
                            {horse.insurance_phone ? (
                                <a
                                    href={`tel:${horse.insurance_phone}`}
                                    className="buttonSmall buttonOrange"
                                >
                                    📞 {horse.insurance_phone}
                                </a>
                            ) : (
                                'Not documented'
                            )}
                        </strong>
                    </div>
                </section>

                {/* 💡 NEW: OWNER ADMIN VIEW WORMING CARD */}
                <section className="card marginbsixteen">
                    <h2 className="textmedium">Worming Schedule & Treatment</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Next Treatment Due:</span> <strong>{wormingDate}</strong>
                    </div>
                    <div className="text-normal marginbeight">
                        <span>Worming Notes & Products Used:</span>
                        <br />
                        <strong>{horse.worming_notes || 'None'}</strong>
                    </div>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium">Veterinary Care & Medications</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Vet Name:</span> <strong>{horse.horse_vet_name || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Practice:</span> <strong>{horse.horse_vet_practice || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Contact Phone:</span>{' '}
                        <strong>
                            {horse.horse_vet_phone_one ? (
                                <a
                                    href={`tel:${horse.horse_vet_phone_one}`}
                                    className="buttonSmall buttonOrange"
                                >
                                    📞 {horse.horse_vet_phone_one}
                                </a>
                            ) : (
                                'N/A'
                            )}
                        </strong>
                    </div>
                    <p className="text-normal marginbsixteen">
                        Medication Log: <br />
                        <strong>{horse.horse_medication || 'None'}</strong>
                    </p>
                    <p className="text-normal">
                        Allergies: <br />
                        <strong>{horse.horse_allergies || 'None'}</strong>
                    </p>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium">Farrier</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Farrier Name:</span> <strong>{horse.farrier_name || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Phone:</span>{' '}
                        <strong>
                            {horse.farrier_phone_one ? (
                                <a
                                    href={`tel:${horse.farrier_phone_one}`}
                                    className="buttonSmall buttonOrange"
                                >
                                    📞 {horse.farrier_phone_one}
                                </a>
                            ) : (
                                'N/A'
                            )}
                        </strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Next Appointment:</span> <strong>{farrierDate}</strong>
                    </div>
                    <div className="text-normal marginbeight">
                        <span>Notes:</span>
                        <br />
                        <strong>{horse.farrier_notes || 'None'}</strong>
                    </div>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium">Dentist</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Dentist Name:</span> <strong>{horse.dentist_name || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Phone:</span>{' '}
                        <strong>
                            {horse.dentist_phone_one ? (
                                <a
                                    href={`tel:${horse.dentist_phone_one}`}
                                    className="buttonSmall buttonOrange"
                                >
                                    📞 {horse.dentist_phone_one}
                                </a>
                            ) : (
                                'N/A'
                            )}
                        </strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Next Exam:</span> <strong>{dentistDate}</strong>
                    </div>
                    <div className="text-normal marginbeight">
                        <span>Notes:</span>
                        <br />
                        <strong>{horse.dentist_notes || 'None'}</strong>
                    </div>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium">Saddle Fitter</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Fitter Name:</span>{' '}
                        <strong>{horse.saddle_fitter_name || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Contact Phone:</span>{' '}
                        <strong>
                            {horse.saddle_fitter_phone ? (
                                <a
                                    href={`tel:${horse.saddle_fitter_phone}`}
                                    className="buttonSmall buttonOrange"
                                >
                                    📞 {horse.saddle_fitter_phone}
                                </a>
                            ) : (
                                'N/A'
                            )}
                        </strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Next Appointment:</span> <strong>{saddleFitterDate}</strong>
                    </div>
                    <div className="text-normal marginbeight">
                        <span>Notes:</span>
                        <br />
                        <strong>{horse.saddle_fitter_notes || 'None'}</strong>
                    </div>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium">Physiotherapist</h2>
                    <div className="text-normal marginbeight datarow">
                        <span>Physio Name:</span> <strong>{horse.physio_name || 'N/A'}</strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Contact Phone:</span>{' '}
                        <strong>
                            {horse.physio_phone ? (
                                <a
                                    href={`tel:${horse.physio_phone}`}
                                    className="buttonSmall buttonOrange"
                                >
                                    📞 {horse.physio_phone}
                                </a>
                            ) : (
                                'N/A'
                            )}
                        </strong>
                    </div>
                    <div className="text-normal marginbeight datarow">
                        <span>Next Appointment:</span> <strong>{physioDate}</strong>
                    </div>
                    <div className="text-normal marginbeight">
                        <span>Notes:</span>
                        <br />
                        <strong>{horse.physio_notes || 'None'}</strong>
                    </div>
                </section>

                <section className="card marginbsixteen">
                    <h2 className="textmedium">Feeding & Turnout</h2>
                    <div className="text-normal">
                        <pre style={{ fontFamily: 'inherit', margin: 0 }}>
                            {horse.feed_instructions || 'N/A'}
                        </pre>
                    </div>
                </section>
            </div>
        </main>
    );
}
