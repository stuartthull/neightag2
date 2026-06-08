import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/equilog.css';

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
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false); // Visual loading state for the switch

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

            const safePayload = {};
            Object.keys(data || {}).forEach(key => {
                if (key in INITIAL_FORM_DATA || key === 'id') {
                    if (key === 'is_public') {
                        safePayload[key] = data[key] ?? true;
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

    // Handle normal form field typing
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // ✅ FIXED: Dedicated instant-save handler for the public profile toggle switch
    const handlePrivacyToggle = async (e) => {
        const newPublicStatus = e.target.checked;

        // 1. Instantly update UI state so it feels fast
        setFormData(prev => ({
            ...prev,
            is_public: newPublicStatus
        }));
        setIsUpdatingPrivacy(true);

        // 2. Save ONLY this single boolean change straight to Supabase
        const { error } = await supabase
            .from('equi_log_main')
            .update({ is_public: newPublicStatus })
            .eq('id', id);

        setIsUpdatingPrivacy(false);

        if (error) {
            // Roll back the UI switch if the database save fails
            setFormData(prev => ({
                ...prev,
                is_public: !newPublicStatus
            }));
            alert("Failed to update privacy setting: " + error.message);
        }
    };

    // Main manual form submission for text inputs
    const handleUpdate = async (e) => {
        e.preventDefault();

        const vitalsPayload = { ...formData };

        if ('id' in vitalsPayload) {
            delete vitalsPayload.id;
        }

        // Clean up empty strings to avoid breaking Postgres rules on numerical/date structures
        Object.keys(vitalsPayload).forEach(key => {
            if (vitalsPayload[key] === '') {
                vitalsPayload[key] = null;
            }
        });

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

    if (loading) return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container">
                    <h1 className="textmedium">Populating comprehensive records...</h1>
                </section>
            </div>
        </div>
    );

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <form onSubmit={handleUpdate}>
                    {/* HERO SECTION */}
                    <section className="section-container purple-section-container">
                        <button type="button" onClick={() => navigate('/dashboard')} className="buttonWhite buttonMain marginbsixteen">
                            ← Back to Dashboard
                        </button>

                        <div>
                            <div>
                                <h1 className="textbig">Edit {formData.horse_name || 'Unnamed'}'s Record</h1>
                            </div>

                            <div style={{ padding: '15px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '15px', width: '100%', opacity: isUpdatingPrivacy ? 0.6 : 1, transition: 'opacity 0.2s' }} className="lightpurple-section-container">
                                <div>
                                    <div className="text-normal"><strong>🌐 Global Public Profile</strong></div>
                                    <p>Turn off to hide your horse's public details</p>
                                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                        {isUpdatingPrivacy ? "Saving changes..." : formData.is_public ? "Profile is Live" : "Profile is Hidden"}
                                    </div>
                                </div>

                                <label className="switch" style={{ flexShrink: 0 }}>
                                    {/* ✅ Uses handlePrivacyToggle instead of handleChange */}
                                    <input type="checkbox" name="is_public" checked={formData.is_public} onChange={handlePrivacyToggle} disabled={isUpdatingPrivacy} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6: EMERGENCY CONTACTS */}
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium marginbeight">Emergency Contacts</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                                <p className="text-normal marginbeight"><strong>Primary Contact</strong></p>
                                <input className="inputText marginbeight" placeholder="Name" name="emergency_name_one" type="text" value={formData.emergency_name_one} onChange={handleChange} />
                                <input className="inputText" placeholder="Phone" name="emergency_phone_one" type="text" value={formData.emergency_phone_one} onChange={handleChange} />
                            </div>
                            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '12px' }}>
                                <p className="text-normal marginbeight"><strong>Secondary Contact</strong></p>
                                <input className="inputText marginbeight" placeholder="Name" name="emergency_name_two" type="text" value={formData.emergency_name_two} onChange={handleChange} />
                                <input className="inputText" placeholder="Phone" name="emergency_phone_two" type="text" value={formData.emergency_phone_two} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 1: CORE PROFILE */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbeight">Horse Identity & Profile</h2>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Horse Name:</span> <input className="inputText" style={{ width: '60%' }} name="horse_name" type="text" value={formData.horse_name} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Breed:</span> <input className="inputText" style={{ width: '60%' }} name="horse_breed" type="text" value={formData.horse_breed} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Colour:</span> <input className="inputText" style={{ width: '60%' }} name="horse_colour" type="text" value={formData.horse_colour} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Height (hh):</span> <input className="inputText" style={{ width: '60%' }} name="horse_height" type="text" value={formData.horse_height} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Date of Birth:</span> <input className="inputText" style={{ width: '60%' }} name="horse_dob" type="date" value={formData.horse_dob} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Passport Number:</span> <input className="inputText" style={{ width: '60%' }} name="horse_passport_number" type="text" value={formData.horse_passport_number} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Weight (kg):</span> <input className="inputText" style={{ width: '60%' }} name="horse_weight_kg" type="text" value={formData.horse_weight_kg} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Last Weighed:</span> <input className="inputText" style={{ width: '60%' }} name="horse_last_weighed" type="date" value={formData.horse_last_weighed} onChange={handleChange} /></div>
                    </section>

                    {/* SECTION 2: VETERINARY */}
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium marginbeight">Veterinary Details</h2>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Vet Name:</span> <input className="inputText" style={{ width: '60%' }} name="horse_vet_name" type="text" value={formData.horse_vet_name} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Vet Practice:</span> <input className="inputText" style={{ width: '60%' }} name="horse_vet_practice" type="text" value={formData.horse_vet_practice} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Vet Phone:</span> <input className="inputText" style={{ width: '60%' }} name="horse_vet_phone_one" type="text" value={formData.horse_vet_phone_one} onChange={handleChange} /></div>

                        <div style={{ marginTop: '20px' }}>
                            <label className="text-normal"><strong>Current Medication</strong></label>
                            <textarea className="inputText" name="horse_medication" value={formData.horse_medication} onChange={handleChange} style={{ height: '80px', marginTop: '5px' }} />
                        </div>
                        <div style={{ marginTop: '15px' }}>
                            <label className="text-normal"><strong>Allergies</strong></label>
                            <textarea className="inputText" name="horse_allergies" value={formData.horse_allergies} onChange={handleChange} style={{ height: '80px', marginTop: '5px' }} />
                        </div>
                    </section>

                    {/* SECTION 3: FARRIER */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbeight">Farrier Log</h2>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Farrier Name:</span> <input className="inputText" style={{ width: '60%' }} name="farrier_name" type="text" value={formData.farrier_name} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Phone:</span> <input className="inputText" style={{ width: '60%' }} name="farrier_phone_one" type="text" value={formData.farrier_phone_one} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Email:</span> <input className="inputText" style={{ width: '60%' }} name="farrier_email" type="email" value={formData.farrier_email} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Last Visit:</span> <input className="inputText" style={{ width: '60%' }} name="farrier_last_visit" type="date" value={formData.farrier_last_visit} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Next Visit:</span> <input className="inputText" style={{ width: '60%' }} name="farrier_next_visit" type="date" value={formData.farrier_next_visit} onChange={handleChange} /></div>
                        <div style={{ marginTop: '15px' }}>
                            <label className="text-normal"><strong>Structural Notes</strong></label>
                            <input className="inputText" name="farrier_notes" type="text" value={formData.farrier_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* SECTION 4: DENTIST */}
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium marginbeight">Equine Dentist Log</h2>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Dentist Name:</span> <input className="inputText" style={{ width: '60%' }} name="dentist_name" type="text" value={formData.dentist_name} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Phone:</span> <input className="inputText" style={{ width: '60%' }} name="dentist_phone_one" type="text" value={formData.dentist_phone_one} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Email:</span> <input className="inputText" style={{ width: '60%' }} name="dentist_email" type="email" value={formData.dentist_email} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Last Exam:</span> <input className="inputText" style={{ width: '60%' }} name="dentist_last_visit" type="date" value={formData.dentist_last_visit} onChange={handleChange} /></div>
                        <div className="text-normal marginbeight" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span>Next Appt:</span> <input className="inputText" style={{ width: '60%' }} name="dentist_next_visit" type="date" value={formData.dentist_next_visit} onChange={handleChange} /></div>
                        <div style={{ marginTop: '15px' }}>
                            <label className="text-normal"><strong>Treatment Notes</strong></label>
                            <input className="inputText" name="dentist_notes" type="text" value={formData.dentist_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* SECTION 5: FEED & INSTRUCTIONS */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbeight">Feeding & Turnout Instructions</h2>
                        <textarea className="inputText" name="feed_instructions" value={formData.feed_instructions} onChange={handleChange} style={{ height: '120px' }} />
                    </section>

                    {/* ✅ SPACER: Prevents the sticky actions bar from hiding the bottom of the feeding section */}
                    <div className="form-content-spacer"></div>

                    {/* ✅ STICKY ACTIONS BAR CONTAINER */}
                    <div className="sticky-actions-bar">
                        <button type="submit" className="buttonSmall buttonPurple">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}