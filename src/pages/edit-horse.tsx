import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const INITIAL_FORM_DATA = {
    horse_name: '',
    is_public: true,
    horse_dob: '',
    horse_weight_kg: '',
    horse_vet_name: '',
    horse_vet_practice: '',
    horse_vet_phone_one: '',
    horse_last_weighed: '',
    horse_passport_number: '',
    horse_medication: '',
    horse_allergies: '',
    farrier_name: '',
    farrier_phone_one: '',
    farrier_email: '',
    farrier_next_visit: '',
    farrier_last_visit: '',
    farrier_notes: '',
    horse_breed: '',
    horse_colour: '',
    horse_height: '',
    dentist_name: '',
    dentist_phone_one: '',
    dentist_email: '',
    dentist_next_visit: '',
    dentist_last_visit: '',
    dentist_notes: '',
    emergency_name_one: '',
    emergency_phone_one: '',
    emergency_name_two: '',
    emergency_phone_two: '',
    feed_instructions: ''
};

export default function EditItem() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    // Master state object strictly tracking core vitals fields and visibility
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);

    useEffect(() => {
        const fetchCoreVitals = async () => {
            const { data, error } = await supabase
                .from('equi_log_main')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                console.error("Error fetching core log payload:", error);
                navigate('/dashboard');
                return;
            }

            // Safeguard database nulls into empty strings for controlled inputs
            const safePayload = {};
            Object.keys(data || {}).forEach(key => {
                if (key in INITIAL_FORM_DATA || key === 'id') {
                    if (key === 'is_public') {
                        safePayload[key] = data[key] ?? true; // Default to true if unassigned
                    } else {
                        safePayload[key] = data[key] === null ? '' : data[key];
                    }
                }
            });

            setFormData({ ...INITIAL_FORM_DATA, ...safePayload });
            setLoading(false);
        };

        fetchCoreVitals();
    }, [id, navigate]);

    // ✅ FIXED: Evaluates input element types to handle boolean values correctly
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleUpdate = async (e) => {
        e.preventDefault();

        // 1. Build outbound payload from controlled form state
        const vitalsPayload = { ...formData };

        // 2. Explicitly append the boolean flag state onto the outbound payload object
        vitalsPayload.is_public = Boolean(formData.is_public);

        const { error } = await supabase
            .from('equi_log_main')
            .update(vitalsPayload)
            .eq('id', id);

        if (error) {
            alert("Database Error: " + error.message);
        } else {
            alert("Changes saved cleanly!");
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="loading">Populating comprehensive records...</div>;

    return (
        <div className="page-wrapper text-padding">
            <div className="container">

                <button onClick={() => navigate('/dashboard')} className="back-link">
                    ← Back to Dashboard
                </button>

                {/* ✅ GLOBAL PUBLIC PROFILE TOGGLE ROW HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 className="heading-title">Edit Vital Logs</h1>
                        <p className="subtext" style={{ margin: 0 }}>Updating records for: <strong>{formData.horse_name || 'Unnamed'}</strong></p>
                    </div>

                    {/* Public Visibility Toggle Card Element */}
                    <div className="card" style={{ padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '15px', borderRadius: '12px' }}>
                        <div>
                            <div className="field-title" style={{ fontSize: '0.95rem' }}>🌐 Global Public Profile</div>
                            <div className="field-status-text" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
                                {formData.is_public ? "Profile is Live" : "Profile is Hidden"}
                            </div>
                        </div>
                        <label className="switch">
                            <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handleChange} />
                            <span className="slider round"></span>
                        </label>
                    </div>
                </div>

                <form onSubmit={handleUpdate} className="dashboard-grid">

                    {/* SECTION 1: CORE PROFILE */}
                    <div className="card">
                        <h3 className="card-title">📋 Horse Identity & Profile</h3>
                        <div className="data-row"><span>Horse Name:</span> <strong><input name="horse_name" type="text" value={formData.horse_name} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Breed:</span> <strong><input name="horse_breed" type="text" value={formData.horse_breed} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Colour:</span> <strong><input name="horse_colour" type="text" value={formData.horse_colour} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Height (hh):</span> <strong><input name="horse_height" type="text" value={formData.horse_height} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Date of Birth:</span> <strong><input name="horse_dob" type="date" value={formData.horse_dob} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Passport Number:</span> <strong><input name="horse_passport_number" type="text" value={formData.horse_passport_number} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Weight (kg):</span> <strong><input name="horse_weight_kg" type="text" value={formData.horse_weight_kg} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Last Weighed:</span> <strong><input name="horse_last_weighed" type="date" value={formData.horse_last_weighed} onChange={handleChange} /></strong></div>
                    </div>

                    {/* SECTION 2: VETERINARY */}
                    <div className="card">
                        <h3 className="card-title">🩺 Veterinary Details</h3>
                        <div className="data-row"><span>Vet Name:</span> <strong><input name="horse_vet_name" type="text" value={formData.horse_vet_name} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Vet Practice:</span> <strong><input name="horse_vet_practice" type="text" value={formData.horse_vet_practice} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Vet Primary Phone:</span> <strong><input name="horse_vet_phone_one" type="text" value={formData.horse_vet_phone_one} onChange={handleChange} className="phone-text" /></strong></div>

                        <div className="label-group">
                            <div className="small-label">Current Medication</div>
                            <textarea name="horse_medication" value={formData.horse_medication} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} />
                        </div>
                        <div className="label-group">
                            <div className="small-label">Allergies</div>
                            <textarea name="horse_allergies" value={formData.horse_allergies} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} />
                        </div>
                    </div>

                    {/* SECTION 3: FARRIER */}
                    <div className="card">
                        <h3 className="card-title">🔨 Farrier Log</h3>
                        <div className="data-row"><span>Farrier Name:</span> <strong><input name="farrier_name" type="text" value={formData.farrier_name} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Farrier Phone:</span> <strong><input name="farrier_phone_one" type="text" value={formData.farrier_phone_one} onChange={handleChange} className="phone-text" /></strong></div>
                        <div className="data-row"><span>Farrier Email:</span> <strong><input name="farrier_email" type="email" value={formData.farrier_email} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Last Visit Date:</span> <strong><input name="farrier_last_visit" type="date" value={formData.farrier_last_visit} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Next Visit Appt:</span> <strong><input name="farrier_next_visit" type="date" value={formData.farrier_next_visit} onChange={handleChange} /></strong></div>

                        <div className="label-group">
                            <div className="small-label">Farrier Structural Notes</div>
                            <input name="farrier_notes" type="text" value={formData.farrier_notes} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} />
                        </div>
                    </div>

                    {/* SECTION 4: DENTIST */}
                    <div className="card">
                        <h3 className="card-title">🦷 Equine Dentist Log</h3>
                        <div className="data-row"><span>Dentist Name:</span> <strong><input name="dentist_name" type="text" value={formData.dentist_name} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Dentist Phone:</span> <strong><input name="dentist_phone_one" type="text" value={formData.dentist_phone_one} onChange={handleChange} className="phone-text" /></strong></div>
                        <div className="data-row"><span>Dentist Email:</span> <strong><input name="dentist_email" type="email" value={formData.dentist_email} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Last Dental Exam:</span> <strong><input name="dentist_last_visit" type="date" value={formData.dentist_last_visit} onChange={handleChange} /></strong></div>
                        <div className="data-row"><span>Next Dental Appt:</span> <strong><input name="dentist_next_visit" type="date" value={formData.dentist_next_visit} onChange={handleChange} /></strong></div>

                        <div className="label-group">
                            <div className="small-label">Dentist Treatment Notes</div>
                            <input name="dentist_notes" type="text" value={formData.dentist_notes} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} />
                        </div>
                    </div>

                    {/* SECTION 5: FEED & INSTRUCTIONS */}
                    <div className="card full-width">
                        <h3 className="card-title">🌾 Feeding & Turnout Instructions</h3>
                        <div className="label-group">
                            <div className="small-label">Detailed Feed Instructions</div>
                            <textarea name="feed_instructions" value={formData.feed_instructions} onChange={handleChange} style={{ width: '100%', height: '100px', marginTop: '5px' }} />
                        </div>
                    </div>

                    {/* SECTION 6: EMERGENCY CONTACTS */}
                    <div className="card emergency-card full-width">
                        <h3 className="card-title emergency-title">🚨 Emergency Contacts</h3>
                        <div className="grid-2">
                            <div className="sub-card">
                                <div className="small-label">Primary Contact Name</div>
                                <input name="emergency_name_one" type="text" value={formData.emergency_name_one} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} />
                                <div className="small-label" style={{ marginTop: '10px' }}>Primary Phone Line</div>
                                <input name="emergency_phone_one" type="text" value={formData.emergency_phone_one} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} className="phone-text" />
                            </div>
                            <div className="sub-card">
                                <div className="small-label">Secondary Contact Name</div>
                                <input name="emergency_name_two" type="text" value={formData.emergency_name_two} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} />
                                <div className="small-label" style={{ marginTop: '10px' }}>Secondary Phone Line</div>
                                <input name="emergency_phone_two" type="text" value={formData.emergency_phone_two} onChange={handleChange} style={{ width: '100%', marginTop: '5px' }} className="phone-text" />
                            </div>
                        </div>
                    </div>

                    {/* FORM CTA CONTROL ACTIONS */}
                    <div className="full-width" style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end', marginTop: '10px' }}>
                        <button type="button" onClick={() => navigate('/dashboard')} className="nav-btn-logout" style={{ background: '#64748b', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem' }}>
                            Cancel Changes
                        </button>
                        <button type="submit" className="nav-btn-logout" style={{ background: '#059669', padding: '12px 24px', borderRadius: '8px', fontSize: '1rem' }}>
                            Save Vital Log Updates
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
