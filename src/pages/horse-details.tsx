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

    // Debug states to help you see exactly what's failing on screen
    const [debugInfo, setDebugInfo] = useState({ userId: 'None', horseOwnerId: 'None', isPublicFlag: 'Unknown' });

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

                // Save debug snapshot values
                setDebugInfo({
                    userId: currentUserId || 'Not Logged In',
                    horseOwnerId: horseOwnerId || 'Empty in DB',
                    isPublicFlag: String(isProfilePublic)
                });

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
            {/* DEBUG CHIP BAR - Remove or comment this section out once everything works flawlessly */}
            {/*<div style={{ background: '#1e293b', color: '#f8fafc', padding: '10px', fontSize: '11px', fontFamily: 'monospace', textAlign: 'center', borderBottom: '2px solid #ef4444' }}>*/}
            {/*    🔧 <strong>Debug Console:</strong> Logged In User ID: <code>{debugInfo.userId}</code> | Horse Creator ID: <code>{debugInfo.horseOwnerId}</code> | Is Owner? <code>{isUserOwner ? "YES" : "NO"}</code> | Public Flag: <code>{debugInfo.isPublicFlag}</code>*/}
            {/*</div>*/}

            <header className="hero">
                <div className="container">
                    <button onClick={() => navigate(-1)} className="back-link">← Back to Stable</button>
                    <div className="hero-content">
                        <div>
                            {shouldShow('show_name') && <h1 className="horse-name">{horse.horse_name}</h1>}
                            <div className="pill-container">
                                {shouldShow('show_breed') && <span className="pill">Breed: {horse.horse_breed || 'N/A'}</span>}
                                {shouldShow('show_colour') && <span className="pill">Color: {horse.horse_colour || 'N/A'}</span>}
                                {shouldShow('show_height') && <span className="pill">Height: {horse.horse_height || 'N/A'} hh</span>}
                            </div>
                        </div>
                        {shouldShow('show_weight') && (
                            <div className="hero-stats">
                                <div>
                                    <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase' }}>Current Weight</span>
                                    <span className="stat-value">{horse.horse_weight_kg || '--'} kg</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div>{`This is : ${debugInfo.isPublicFlag}`}</div>

            <main className="container">
                <div className="dashboard-grid">

                    {/* IDENTITY CARD */}
                    {(isUserOwner || shouldShow('show_dob') || shouldShow('show_passport') || shouldShow('show_last_weighed')) && (
                        <section className="card">
                            <h3 className="card-title">🪪 Identity & Identification</h3>
                            {shouldShow('show_dob') && <div className="data-row"><span>Date of Birth</span> <strong>{horse.horse_dob || 'N/A'}</strong></div>}
                            {shouldShow('show_passport') && <div className="data-row"><span>Passport Number</span> <strong>{horse.horse_passport_number || 'N/A'}</strong></div>}
                            {shouldShow('show_last_weighed') && <div className="data-row"><span>Last Weighed</span> <strong>{horse.horse_last_weighed || 'N/A'}</strong></div>}
                            <div className="data-row"><span>Record Created</span> <strong>{new Date(horse.created_at).toLocaleDateString()}</strong></div>
                        </section>
                    )}

                    {/* VETERINARY CARD */}
                    {(shouldShow('show_vet_name') || shouldShow('show_vet_practice') || shouldShow('show_vet_phone') || shouldShow('show_medication') || shouldShow('show_allergies')) && (
                        <section className="card">
                            <h3 className="card-title">🩺 Veterinary Care</h3>
                            {shouldShow('show_vet_name') && <div className="data-row"><span>Vet Name</span> <strong>{horse.horse_vet_name || 'N/A'}</strong></div>}
                            {shouldShow('show_vet_practice') && <div className="data-row"><span>Practice</span> <strong>{horse.horse_vet_practice || 'N/A'}</strong></div>}
                            {shouldShow('show_vet_phone') && <div className="data-row"><span>Contact Phone</span> <strong className="phone-text">{horse.horse_vet_phone_one || 'N/A'}</strong></div>}

                            {/* Dynamic divider line logic */}
                            {(shouldShow('show_vet_name') || shouldShow('show_vet_practice')) && (shouldShow('show_medication') || shouldShow('show_allergies')) && <div className="divider" />}

                            {shouldShow('show_medication') && <div className="data-row"><span>Medication Log</span> <strong className="alert-text">{horse.horse_medication || 'None'}</strong></div>}
                            {shouldShow('show_allergies') && <div className="data-row"><span>Allergies</span> <strong className="alert-text">{horse.horse_allergies || 'None'}</strong></div>}
                        </section>
                    )}

                    {/* FARRIER CARD */}
                    {(shouldShow('show_farrier_name') || shouldShow('show_farrier_phone') || shouldShow('show_farrier_email') || shouldShow('show_farrier_last') || shouldShow('show_farrier_next') || shouldShow('show_farrier_notes')) && (
                        <section className="card">
                            <h3 className="card-title">🔨 Farrier Services</h3>
                            {shouldShow('show_farrier_name') && <div className="data-row"><span>Farrier Name</span> <strong>{horse.farrier_name || 'N/A'}</strong></div>}
                            {shouldShow('show_farrier_phone') && <div className="data-row"><span>Phone Number</span> <strong>{horse.farrier_phone_one || 'N/A'}</strong></div>}
                            {shouldShow('show_farrier_email') && <div className="data-row"><span>Email Address</span> <strong>{horse.farrier_email || 'N/A'}</strong></div>}
                            {shouldShow('show_farrier_last') && <div className="data-row"><span>Last Visit</span> <strong>{horse.farrier_last_visit || 'N/A'}</strong></div>}
                            {shouldShow('show_farrier_next') && <div className="data-row"><span>Next Appointment</span> <strong style={{ color: '#059669' }}>{horse.farrier_next_visit || 'TBC'}</strong></div>}
                            {shouldShow('show_farrier_notes') && <div className="data-row"><span>Farrier Notes</span> <strong>{horse.farrier_notes || 'None'}</strong></div>}
                        </section>
                    )}

                    {/* DENTIST CARD */}
                    {(shouldShow('show_dentist_name') || shouldShow('show_dentist_phone') || shouldShow('show_dentist_email') || shouldShow('show_dentist_last') || shouldShow('show_dentist_next') || shouldShow('show_dentist_notes')) && (
                        <section className="card">
                            <h3 className="card-title">🦷 Dental Log</h3>
                            {shouldShow('show_dentist_name') && <div className="data-row"><span>Dentist Name</span> <strong>{horse.dentist_name || 'N/A'}</strong></div>}
                            {shouldShow('show_dentist_phone') && <div className="data-row"><span>Phone Number</span> <strong>{horse.dentist_phone_one || 'N/A'}</strong></div>}
                            {shouldShow('show_dentist_email') && <div className="data-row"><span>Email Address</span> <strong>{horse.dentist_email || 'N/A'}</strong></div>}
                            {shouldShow('show_dentist_last') && <div className="data-row"><span>Last Exam</span> <strong>{horse.dentist_last_visit || 'N/A'}</strong></div>}
                            {shouldShow('show_dentist_next') && <div className="data-row"><span>Next Exam Due</span> <strong style={{ color: '#dc2626' }}>{horse.dentist_next_visit || 'TBC'}</strong></div>}
                            {shouldShow('show_dentist_notes') && <div className="data-row"><span>Dental Notes</span> <strong>{horse.dentist_notes || 'None'}</strong></div>}
                        </section>
                    )}

                    {/* FEEDING CARD */}
                    {shouldShow('show_feeding') && (
                        <section className="card full-width">
                            <h3 className="card-title">🌾 Feeding & Turnout Instructions</h3>
                            <div className="text-area-display">
                                {horse.feed_instructions || 'Standard dietary requirements apply.'}
                            </div>
                        </section>
                    )}

                    {/* EMERGENCY CARD */}
                    {(shouldShow('show_emergency_name_one') || shouldShow('show_emergency_phone_one') || shouldShow('show_emergency_name_two') || shouldShow('show_emergency_phone_two')) && (
                        <section className="card full-width emergency-card">
                            <h3 className="card-title emergency-title">🚨 Emergency Protocols</h3>
                            <div className="grid-2">
                                {(shouldShow('show_emergency_name_one') || shouldShow('show_emergency_phone_one')) && (
                                    <div className="sub-card">
                                        {shouldShow('show_emergency_name_one') && <div className="data-row"><span>Primary Contact</span> <strong>{horse.emergency_name_one || 'N/A'}</strong></div>}
                                        {shouldShow('show_emergency_phone_one') && <div className="data-row"><span>Phone</span> <strong className="phone-text">{horse.emergency_phone_one || 'N/A'}</strong></div>}
                                    </div>
                                )}
                                {(shouldShow('show_emergency_name_two') || shouldShow('show_emergency_phone_two')) && (
                                    <div className="sub-card">
                                        {shouldShow('show_emergency_name_two') && <div className="data-row"><span>Secondary Contact</span> <strong>{horse.emergency_name_two || 'N/A'}</strong></div>}
                                        {shouldShow('show_emergency_phone_two') && <div className="data-row"><span>Phone</span> <strong className="phone-text">{horse.emergency_phone_two || 'N/A'}</strong></div>}
                                    </div>
                                )}
                            </div>
                        </section>
                    )}

                </div>
            </main>
        </div>
    );
}