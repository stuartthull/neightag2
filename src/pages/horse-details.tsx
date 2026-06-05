import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/equilog.css';

export default function HorseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [horse, setHorse] = useState(null);
    const [privacySettings, setPrivacySettings] = useState(null);
    const [isUserOwner, setIsUserOwner] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const dataEngine = async () => {
            try {
                // 1. Fetch current auth session cleanly
                const { data: { session } } = await supabase.auth.getSession();
                const currentUserId = session?.user?.id || null;

                // 2. Fetch Horse Data
                const { data: horseData, error: horseError } = await supabase
                    .from('equi_log_main')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (horseError || !horseData) {
                    alert("This record does not exist.");
                    navigate('/');
                    return;
                }

                // 3. Match user IDs (trimming spaces to avoid string mismatches)
                const horseOwnerId = horseData?.user_uuid;
                const isOwner = currentUserId && horseOwnerId &&
                    String(currentUserId).trim() === String(horseOwnerId).trim();

                // Determine effective public visibility (fallback to true if column value is missing)
                const isProfilePublic = horseData.is_public ?? true;

                // 4. GLOBAL PRIVACY PROTECTION LOCKOUT RULE:
                // Direct homepage redirection if profile isn't public AND current viewer is not the profile owner
                if (!isOwner && !isProfilePublic) {
                    console.log("Access Denied: Global profile flag is set to private.");
                    navigate('/');
                    return;
                }

                // 5. Fetch granular column privacy rules matrix
                const { data: privacyData } = await supabase
                    .from('horse_privacy')
                    .select('*')
                    .eq('horse_id', id)
                    .maybeSingle(); // safer syntax over single() in case no secondary matrix row has been written yet

                setHorse(horseData);
                setPrivacySettings(privacyData);
                setIsUserOwner(isOwner);
            } catch (err) {
                console.error("Error processing equine records:", err);
            } finally {
                setLoading(false);
            }
        };
        dataEngine();
    }, [id, navigate]);

    if (loading) return <div className="loading">Accessing Equine Records...</div>;
    if (!horse) return null; // Safety break layout guard

    // Helper checks if you are the logged-in owner, or if the individual field is turned on
    const shouldShow = (privacyField) => {
        if (isUserOwner) return true; // Owner always sees everything
        if (!privacySettings) return true; // If no matrix custom rules exist yet, show field by default
        return !!privacySettings[privacyField];
    };

    return (
        <div className="page-wrapper">
            <div className="page-container">
                {/* HERO SECTION */}
                <section className="section-container purple-section-container">
                    <button onClick={() => navigate(-1)} className="buttonWhite buttonMain" style={{ marginBottom: '20px' }}>
                        ← Back to Dashboard
                    </button>

                    {shouldShow('show_name') && <h1 className="textbig">{horse.horse_name}</h1>}

                    <div style={{ marginTop: '10px' }}>
                        {shouldShow('show_breed') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Breed:</span> <strong>{horse.horse_breed || 'N/A'}</strong></div>}
                        {shouldShow('show_colour') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Color:</span> <strong>{horse.horse_colour || 'N/A'}</strong></div>}
                        {shouldShow('show_height') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Height:</span> <strong>{horse.horse_height || 'N/A'} hh</strong></div>}
                        {shouldShow('show_weight') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Current Weight:</span> <strong>{horse.horse_weight_kg || '--'} kg</strong></div>}
                    </div>
                </section>

                {/* EMERGENCY SECTION */}
                {(shouldShow('show_emergency_name_one') || shouldShow('show_emergency_phone_one') || shouldShow('show_emergency_name_two') || shouldShow('show_emergency_phone_two')) && (
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium">Emergency Protocols</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '10px' }}>
                            {(shouldShow('show_emergency_name_one') || shouldShow('show_emergency_phone_one')) && (
                                <div>
                                    <p className="text-normal"><strong>Primary Contact:</strong></p>
                                    <p className="text-normal">{horse.emergency_name_one || 'N/A'}</p>
                                    <p className="text-normal">{horse.emergency_phone_one || 'N/A'}</p>
                                </div>
                            )}
                            {(shouldShow('show_emergency_name_two') || shouldShow('show_emergency_phone_two')) && (
                                <div>
                                    <p className="text-normal"><strong>Secondary Contact:</strong></p>
                                    <p className="text-normal">{horse.emergency_name_two || 'N/A'}</p>
                                    <p className="text-normal">{horse.emergency_phone_two || 'N/A'}</p>
                                </div>
                            )}
                        </div>
                    </section>
                )}

                {/* IDENTITY SECTION */}
                {(isUserOwner || shouldShow('show_dob') || shouldShow('show_passport') || shouldShow('show_last_weighed')) && (
                    <section className="section-container white-section-container">
                        <h2 className="textmedium">Identity & Identification</h2>
                        {shouldShow('show_dob') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Date of Birth:</span> <strong>{horse.horse_dob || 'N/A'}</strong></div>}
                        {shouldShow('show_passport') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Passport Number:</span> <strong>{horse.horse_passport_number || 'N/A'}</strong></div>}
                        {shouldShow('show_last_weighed') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Last Weighed:</span> <strong>{horse.horse_last_weighed || 'N/A'}</strong></div>}
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Record Created:</span> <strong>{new Date(horse.created_at).toLocaleDateString()}</strong></div>
                    </section>
                )}

                {/* VETERINARY SECTION */}
                {(shouldShow('show_vet_name') || shouldShow('show_vet_practice') || shouldShow('show_vet_phone') || shouldShow('show_medication') || shouldShow('show_allergies')) && (
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium">Veterinary Care</h2>
                        {shouldShow('show_vet_name') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Vet Name:</span> <strong>{horse.horse_vet_name || 'N/A'}</strong></div>}
                        {shouldShow('show_vet_practice') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Practice:</span> <strong>{horse.horse_vet_practice || 'N/A'}</strong></div>}
                        {shouldShow('show_vet_phone') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Contact Phone:</span> <strong>{horse.horse_vet_phone_one || 'N/A'}</strong></div>}
                        {shouldShow('show_medication') && <p className="text-normal" style={{ marginTop: '10px' }}>Medication Log: <br /><strong>{horse.horse_medication || 'None'}</strong></p>}
                        {shouldShow('show_allergies') && <p className="text-normal">Allergies: <br /><strong>{horse.horse_allergies || 'None'}</strong></p>}
                    </section>
                )}

                {/* FARRIER SECTION */}
                {(shouldShow('show_farrier_name') || shouldShow('show_farrier_phone') || shouldShow('show_farrier_email') || shouldShow('show_farrier_last') || shouldShow('show_farrier_next') || shouldShow('show_farrier_notes')) && (
                    <section className="section-container white-section-container">
                        <h2 className="textmedium">Farrier Services</h2>
                        {shouldShow('show_farrier_name') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Farrier Name:</span> <strong>{horse.farrier_name || 'N/A'}</strong></div>}
                        {shouldShow('show_farrier_phone') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Phone:</span> <strong>{horse.farrier_phone_one || 'N/A'}</strong></div>}
                        {shouldShow('show_farrier_email') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Email:</span> <strong>{horse.farrier_email || 'N/A'}</strong></div>}
                        {shouldShow('show_farrier_last') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Last Visit:</span> <strong>{horse.farrier_last_visit || 'N/A'}</strong></div>}
                        {shouldShow('show_farrier_next') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Next Appointment:</span> <strong>{horse.farrier_next_visit || 'TBC'}</strong></div>}
                        {shouldShow('show_farrier_notes') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Notes:</span> <strong>{horse.farrier_notes || 'None'}</strong></div>}
                    </section>
                )}

                {/* DENTIST SECTION */}
                {(shouldShow('show_dentist_name') || shouldShow('show_dentist_phone') || shouldShow('show_dentist_email') || shouldShow('show_dentist_last') || shouldShow('show_dentist_next') || shouldShow('show_dentist_notes')) && (
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium">Dental Log</h2>
                        {shouldShow('show_dentist_name') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Dentist Name:</span> <strong>{horse.dentist_name || 'N/A'}</strong></div>}
                        {shouldShow('show_dentist_phone') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Phone:</span> <strong>{horse.dentist_phone_one || 'N/A'}</strong></div>}
                        {shouldShow('show_dentist_email') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Email:</span> <strong>{horse.dentist_email || 'N/A'}</strong></div>}
                        {shouldShow('show_dentist_last') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Last Exam:</span> <strong>{horse.dentist_last_visit || 'N/A'}</strong></div>}
                        {shouldShow('show_dentist_next') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Next Exam:</span> <strong>{horse.dentist_next_visit || 'TBC'}</strong></div>}
                        {shouldShow('show_dentist_notes') && <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between' }}><span>Notes:</span> <strong>{horse.dentist_notes || 'None'}</strong></div>}
                    </section>
                )}

                {/* FEEDING SECTION */}
                {shouldShow('show_feeding') && (
                    <section className="section-container white-section-container">
                        <h2 className="textmedium">Feeding & Turnout</h2>
                        <p className="text-normal">{horse.feed_instructions || 'Standard dietary requirements apply.'}</p>
                    </section>
                )}

            </div>
        </div>
    );
}