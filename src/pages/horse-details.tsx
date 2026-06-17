import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { formatGBDate } from "../utils/date-format";

export default function HorseDetails() {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const navigate = useNavigate();
    const [horse, setHorse] = useState<any>(null);
    const [privacySettings, setPrivacySettings] = useState<any>(null);
    const [calendarMap, setCalendarMap] = useState<Record<string, string>>({});
    const [isUserOwner, setIsUserOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dataEngine = async () => {
            try {
                if (!horse_uuid) {
                    console.error("Missing Horse UUID parameter context. Check your App.tsx route configuration.");
                    navigate('/');
                    return;
                }

                // 1. Fetch current auth session cleanly
                const { data: { session } } = await supabase.auth.getSession();
                const currentUserId = session?.user?.id || null;

                // 2. Fetch Horse Data filtered via unique horse_uuid along with its sub-query calendar arrays
                const { data: horseData, error: horseError } = await supabase
                    .from('equi_log_main')
                    .select(`
                        *,
                        equi_calendar (
                            calendar_title,
                            calendar_date,
                            calendar_notes
                        )
                    `)
                    .eq('horse_uuid', horse_uuid)
                    .single();

                if (horseError || !horseData) {
                    console.error("Database lookup failed:", horseError?.message);
                    alert(`This record does not exist or cannot be reached. Error: ${horseError?.message || 'Empty raw data'}`);
                    navigate('/');
                    return;
                }

                // 3. Match user IDs
                const horseOwnerId = horseData?.user_uuid;
                const isOwner = currentUserId && horseOwnerId &&
                    String(currentUserId).trim() === String(horseOwnerId).trim();

                const isProfilePublic = horseData.is_public ?? false;

                // 4. GLOBAL PRIVACY PROTECTION LOCKOUT RULE
                if (!isOwner && !isProfilePublic) {
                    alert("Access Denied: This horse profile is set to private.");
                    navigate('/');
                    return;
                }

                // 5. Fetch granular matrix matching row parameters safely using the horse_uuid
                const { data: privacyData, error: privacyError } = await supabase
                    .from('equi_log_show')
                    .select('*')
                    .eq('horse_uuid', horse_uuid)
                    .maybeSingle();

                if (privacyError) {
                    console.error("Error reading privacy configurations:", privacyError.message);
                }

                // 6. Map the inner array from equi_calendar securely to easily readable key/values
                const innerCalendarRows = horseData.equi_calendar || [];
                const scheduleLookups: Record<string, string> = {};
                innerCalendarRows.forEach((item: any) => {
                    if (item.calendar_title && item.calendar_date) {
                        // Keep just the date portion string cleanly
                        scheduleLookups[item.calendar_title] = String(item.calendar_date).split('T')[0];
                    }
                });

                setHorse(horseData);
                setPrivacySettings(privacyData);
                setCalendarMap(scheduleLookups);
                setIsUserOwner(isOwner);
            } catch (err) {
                console.error("Error processing equine records:", err);
            } finally {
                setLoading(false);
            }
        };
        dataEngine();
    }, [horse_uuid, navigate]);

    if (loading) return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container">
                    <div className="loading">LOADING: Accessing Equine Records...</div>
                </section>
            </div>
        </div>
    );

    if (!horse) return null;

    const shouldShow = (privacyField: string) => {
        if (!privacySettings) return isUserOwner;
        const value = privacySettings[privacyField];
        return value === true || String(value).toLowerCase() === 'true';
    };

    // Extract dynamic calendar dates with clean format wrappers
    const saddleFitterDate = calendarMap['Saddle Fitter Visit'] ? formatGBDate(calendarMap['Saddle Fitter Visit']) : 'TBC';
    const physioDate = calendarMap['Physio Visit'] ? formatGBDate(calendarMap['Physio Visit']) : 'TBC';
    const farrierDate = calendarMap['Farrier Visit'] ? formatGBDate(calendarMap['Farrier Visit']) : 'TBC';
    const dentistDate = calendarMap['Dentist Visit'] ? formatGBDate(calendarMap['Dentist Visit']) : 'TBC';

    return (
        <div className="page-wrapper">
            <div className="page-container">

                {/* OWNER PREVIEW BANNER */}
                {isUserOwner && (
                    <div className="alert-banner-warning">
                        👀 <strong>Owner Preview:</strong> <br />You are seeing this page exactly as it appears to the public based on your privacy settings.
                    </div>
                )}

                {/* HERO SECTION */}
                <section className="section-container purple-section-container">
                    {shouldShow('show_name') && <h1 className="textbig">{horse.horse_name}</h1>}

                    <div style={{ marginTop: '10px' }}>
                        {shouldShow('show_breed') && <div className="text-normal marginbeight"><span>Breed:</span> <strong>{horse.horse_breed || 'N/A'}</strong></div>}
                        {shouldShow('show_colour') && <div className="text-normal marginbeight"><span>Color:</span> <strong>{horse.horse_colour || 'N/A'}</strong></div>}
                    </div>
                </section>

                {/* EMERGENCY SECTION */}
                <section className="section-container white-section-container">
                    {(shouldShow('show_emergency_name_one') || shouldShow('show_emergency_phone_one') || shouldShow('show_emergency_name_two') || shouldShow('show_emergency_phone_two')) && (
                        <>
                            <h2 className="textbig">Emergency Protocols</h2>
                            {(shouldShow('show_emergency_name_one') || shouldShow('show_emergency_phone_one')) && (
                                <div className="horsebox-panel breakdown-panel">
                                    <p className="text-normal"><strong>Primary Contact:</strong></p>
                                    {shouldShow('show_emergency_name_one') && <p className="text-normal marginbsixteen">{horse.emergency_name_one || 'N/A'}</p>}
                                    {shouldShow('show_emergency_phone_one') && (
                                        <p className="text-normal">
                                            <a href={`tel:${horse.emergency_phone_one}`} className="buttonMain buttonOrange">
                                                📞 {horse.emergency_phone_one || 'N/A'}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            )}
                            {(shouldShow('show_emergency_name_two') || shouldShow('show_emergency_phone_two')) && (
                                <div className="horsebox-panel breakdown-panel">
                                    <p className="text-normal"><strong>Secondary Contact:</strong></p>
                                    {shouldShow('show_emergency_name_two') && <p className="text-normal marginbsixteen">{horse.emergency_name_two || 'N/A'}</p>}
                                    {shouldShow('show_emergency_phone_two') && (
                                        <p className="text-normal">
                                            <a href={`tel:${horse.emergency_phone_two}`} className="buttonMain buttonOrange">
                                                📞 {horse.emergency_phone_two || 'N/A'}
                                            </a>
                                        </p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </section>

                {/* IDENTITY SECTION */}
                {(shouldShow('show_dob') || shouldShow('show_passport') || shouldShow('show_last_weighed') || shouldShow('show_height') || shouldShow('show_weight')) && (
                    <section className="card marginbsixteen">
                        <h2 className="textmedium marginbsixteen">Identity & Identification</h2>
                        {shouldShow('show_dob') && <div className="text-normal marginbeight datarow"><span>Date of Birth:</span> <strong>{formatGBDate(horse.horse_dob) || 'N/A'}</strong></div>}
                        {shouldShow('show_passport') && <div className="text-normal marginbeight datarow"><span>Passport Number:</span> <strong>{horse.horse_passport_number || 'N/A'}</strong></div>}
                        {shouldShow('show_height') && <div className="text-normal marginbeight datarow"><span>Height:</span> <strong>{horse.horse_height || 'N/A'} hh</strong></div>}
                        {shouldShow('show_weight') && <div className="text-normal marginbeight datarow"><span>Current Weight:</span> <strong>{horse.horse_weight_kg || '--'} kg</strong></div>}
                        {shouldShow('show_last_weighed') && <div className="text-normal marginbeight datarow"><span>Last Weighed:</span> <strong>{formatGBDate(horse.horse_last_weighed) || 'N/A'}</strong></div>}
                    </section>
                )}

                {/* VETERINARY SECTION */}
                {(shouldShow('show_vet_name') || shouldShow('show_vet_practice') || shouldShow('show_vet_phone') || shouldShow('show_medication') || shouldShow('show_allergies')) && (
                    <section className="card marginbsixteen">
                        <h2 className="textmedium">Veterinary Care</h2>
                        {shouldShow('show_vet_name') && <div className="text-normal marginbeight datarow"><span>Vet Name:</span> <strong>{horse.horse_vet_name || 'N/A'}</strong></div>}
                        {shouldShow('show_vet_practice') && <div className="text-normal marginbeight datarow"><span>Practice:</span> <strong>{horse.horse_vet_practice || 'N/A'}</strong></div>}
                        {shouldShow('show_vet_phone') && <div className="text-normal marginbeight datarow"><span>Contact Phone:</span> <strong>
                            {horse.horse_vet_phone_one ? (
                                <a href={`tel:${horse.horse_vet_phone_one}`}>{horse.horse_vet_phone_one}</a>
                            ) : (
                                'N/A'
                            )}
                        </strong></div>}
                        {shouldShow('show_medication') && <p className="text-normal marginbsixteen">Medication Log: <br /><strong>{horse.horse_medication || 'None'}</strong></p>}
                        {shouldShow('show_allergies') && <p className="text-normal">Allergies: <br /><strong>{horse.horse_allergies || 'None'}</strong></p>}
                    </section>
                )}

                {/* SADDLE FITTER SECTION */}
                {(shouldShow('show_saddle_fitter_name') || shouldShow('show_saddle_fitter_phone') || shouldShow('show_saddle_fitter_next') || shouldShow('show_saddle_fitter_notes')) && (
                    <section className="card marginbsixteen">
                        <h2 className="textmedium">Saddle Fitter</h2>
                        {shouldShow('show_saddle_fitter_name') && <div className="text-normal marginbeight datarow"><span>Fitter Name:</span> <strong>{horse.saddle_fitter_name || 'N/A'}</strong></div>}
                        {shouldShow('show_saddle_fitter_phone') && <div className="text-normal marginbeight datarow"><span>Contact Phone:</span> <strong>
                            {horse.saddle_fitter_phone ? (
                                <a href={`tel:${horse.saddle_fitter_phone}`}>{horse.saddle_fitter_phone}</a>
                            ) : (
                                'N/A'
                            )}
                        </strong></div>}
                        {/* 🗓️ Pulls directly from matching calendar variable */}
                        {shouldShow('show_saddle_fitter_next') && <div className="text-normal marginbeight datarow"><span>Next Appointment:</span> <strong>{saddleFitterDate}</strong></div>}
                        {shouldShow('show_saddle_fitter_notes') && <div className="text-normal marginbeight"><span>Notes:</span><br /><strong>{horse.saddle_fitter_notes || 'None'}</strong></div>}
                    </section>
                )}

                {/* PHYSIO SECTION */}
                {(shouldShow('show_physio_name') || shouldShow('show_physio_phone') || shouldShow('show_physio_next') || shouldShow('show_physio_notes')) && (
                    <section className="card marginbsixteen">
                        <h2 className="textmedium">Physiotherapist</h2>
                        {shouldShow('show_physio_name') && <div className="text-normal marginbeight datarow"><span>Physio Name:</span> <strong>{horse.physio_name || 'N/A'}</strong></div>}
                        {shouldShow('show_physio_phone') && <div className="text-normal marginbeight datarow"><span>Contact Phone:</span> <strong>
                            {horse.physio_phone ? (
                                <a href={`tel:${horse.physio_phone}`}>{horse.physio_phone}</a>
                            ) : (
                                'N/A'
                            )}
                        </strong></div>}
                        {/* 🗓️ Pulls directly from matching calendar variable */}
                        {shouldShow('show_physio_next') && <div className="text-normal marginbeight datarow"><span>Next Appointment:</span> <strong>{physioDate}</strong></div>}
                        {shouldShow('show_physio_notes') && <div className="text-normal marginbeight"><span>Notes:</span><br /><strong>{horse.physio_notes || 'None'}</strong></div>}
                    </section>
                )}

                {/* FARRIER SECTION */}
                {(shouldShow('show_farrier_name') || shouldShow('show_farrier_phone_one') || shouldShow('show_farrier_email') || shouldShow('show_farrier_last') || shouldShow('show_farrier_next') || shouldShow('show_farrier_notes')) && (
                    <section className="card marginbsixteen">
                        <h2 className="textmedium">Farrier</h2>
                        {shouldShow('show_farrier_name') && <div className="text-normal marginbeight datarow"><span>Farrier Name:</span> <strong>{horse.farrier_name || 'N/A'}</strong></div>}
                        {shouldShow('show_farrier_phone_one') && <div className="text-normal marginbeight datarow"><span>Phone:</span> <strong>
                            {horse.farrier_phone_one ? (
                                <a href={`tel:${horse.farrier_phone_one}`}>{horse.farrier_phone_one}</a>
                            ) : (
                                'N/A'
                            )}
                        </strong></div>}
                        {shouldShow('show_farrier_email') && <div className="text-normal marginbeight datarow"><span>Email:</span> <strong>{horse.farrier_email ? (
                            <a href={`mailto:${horse.farrier_email}`}>{horse.farrier_email}</a>
                        ) : (
                            'N/A'
                        )}</strong></div>}
                        {/* 🗓️ Pulls directly from matching calendar variable */}
                        {shouldShow('show_farrier_next') && <div className="text-normal marginbeight datarow"><span>Next Appointment:</span> <strong>{farrierDate}</strong></div>}
                        {shouldShow('show_farrier_notes') && <div className="text-normal marginbeight"><span>Notes:</span><br /><strong>{horse.farrier_notes || 'None'}</strong></div>}
                    </section>
                )}

                {/* DENTIST SECTION */}
                {(shouldShow('show_dentist_name') || shouldShow('show_dentist_phone') || shouldShow('show_dentist_email') || shouldShow('show_dentist_last') || shouldShow('show_dentist_next') || shouldShow('show_dentist_notes')) && (
                    <section className="card marginbsixteen">
                        <h2 className="textmedium">Dentist</h2>
                        {shouldShow('show_dentist_name') && <div className="text-normal marginbeight datarow"><span>Dentist Name:</span> <strong>{horse.dentist_name || 'N/A'}</strong></div>}
                        {shouldShow('show_dentist_phone') && <div className="text-normal marginbeight datarow"><span>Phone:</span> <strong>
                            {horse.dentist_phone_one ? (
                                <a href={`tel:${horse.dentist_phone_one}`}>{horse.dentist_phone_one}</a>
                            ) : (
                                'N/A'
                            )}</strong></div>}
                        {shouldShow('show_dentist_email') && <div className="text-normal marginbeight datarow"><span>Email:</span> <strong>
                            {horse.dentist_email ? (
                                <a href={`mailto:${horse.dentist_email}`}>{horse.dentist_email}</a>
                            ) : (
                                'N/A'
                            )}
                        </strong></div>}
                        {/* 🗓️ Pulls directly from matching calendar variable */}
                        {shouldShow('show_dentist_next') && <div className="text-normal marginbeight datarow"><span>Next Exam:</span> <strong>{dentistDate}</strong></div>}
                        {shouldShow('show_dentist_notes') && <div className="text-normal marginbeight"><span>Notes:</span><br /><strong>{horse.dentist_notes || 'None'}</strong></div>}
                    </section>
                )}

                {/* FEEDING SECTION */}
                {shouldShow('show_feeding') && (
                    <section className="card marginbsixteen">
                        <h2 className="textmedium">Feeding & Turnout</h2>
                        <div className="text-normal"><pre>{horse.feed_instructions || 'N/A'}</pre></div>
                    </section>
                )}

            </div>
        </div>
    );
}