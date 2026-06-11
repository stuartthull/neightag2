import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import '../css/edit-horse.css';

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

export default function EditItem(): React.JSX.Element {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState(INITIAL_FORM_DATA);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePrivacyToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPublicStatus = e.target.checked;

        setFormData(prev => ({
            ...prev,
            is_public: newPublicStatus
        }));
        setIsUpdatingPrivacy(true);

        const { error } = await supabase
            .from('equi_log_main')
            .update({ is_public: newPublicStatus })
            .eq('id', id);

        setIsUpdatingPrivacy(false);

        if (error) {
            setFormData(prev => ({
                ...prev,
                is_public: !newPublicStatus
            }));
            alert("Failed to update privacy setting: " + error.message);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const vitalsPayload = { ...formData };

        if ('id' in vitalsPayload) {
            delete vitalsPayload.id;
        }

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

                            <div
                                className="orange-section-container privacy-toggle-container"
                                style={{ opacity: isUpdatingPrivacy ? 0.6 : 1 }}
                            >
                                <div>
                                    <div className="text-normal"><strong>🌐 Global Public Profile</strong></div>
                                    <p>Turn off to hide your horse's public details</p>
                                    <div className="privacy-toggle-meta">
                                        {isUpdatingPrivacy ? "Saving changes..." : formData.is_public ? "Profile is Live" : "Profile is Hidden"}
                                    </div>
                                </div>

                                <label className="switch switch-wrapper" htmlFor="is_public">
                                    <input
                                        type="checkbox"
                                        id="is_public"
                                        name="is_public"
                                        checked={formData.is_public}
                                        onChange={handlePrivacyToggle}
                                        disabled={isUpdatingPrivacy}
                                    />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* SECTION 6: EMERGENCY CONTACTS */}
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium marginbeight">Emergency Contacts</h2>
                        <div className="form-grid-two">
                            <div className="form-grid-card">
                                <p className="text-normal marginbeight"><strong>Primary Contact</strong></p>
                                <label htmlFor="emergency_name_one" className="sr-only" style={{ display: 'none' }}>Primary Contact Name</label>
                                <input className="inputText marginbeight" id="emergency_name_one" placeholder="Name" name="emergency_name_one" type="text" value={formData.emergency_name_one} onChange={handleChange} />
                                <label htmlFor="emergency_phone_one" className="sr-only" style={{ display: 'none' }}>Primary Contact Phone</label>
                                <input className="inputText" id="emergency_phone_one" placeholder="Phone" name="emergency_phone_one" type="text" value={formData.emergency_phone_one} onChange={handleChange} />
                            </div>
                            <div className="form-grid-card">
                                <p className="text-normal marginbeight"><strong>Secondary Contact</strong></p>
                                <label htmlFor="emergency_name_two" className="sr-only" style={{ display: 'none' }}>Secondary Contact Name</label>
                                <input className="inputText marginbeight" id="emergency_name_two" placeholder="Name" name="emergency_name_two" type="text" value={formData.emergency_name_two} onChange={handleChange} />
                                <label htmlFor="emergency_phone_two" className="sr-only" style={{ display: 'none' }}>Secondary Contact Phone</label>
                                <input className="inputText" id="emergency_phone_two" placeholder="Phone" name="emergency_phone_two" type="text" value={formData.emergency_phone_two} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* SECTION 1: CORE PROFILE */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Horse Identity & Profile</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_name">Horse Name:</label>
                            <input className="inputText" id="horse_name" name="horse_name" type="text" value={formData.horse_name} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_breed">Breed:</label>
                            <input className="inputText" id="horse_breed" name="horse_breed" type="text" value={formData.horse_breed} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_colour">Colour:</label>
                            <input className="inputText" id="horse_colour" name="horse_colour" type="text" value={formData.horse_colour} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_height">Height (hh):</label>
                            <input className="inputText" id="horse_height" name="horse_height" type="text" value={formData.horse_height} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_dob">Date of Birth:</label>
                            <input className="inputText" id="horse_dob" name="horse_dob" type="date" value={formData.horse_dob} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_passport_number">Passport Number:</label>
                            <input className="inputText" id="horse_passport_number" name="horse_passport_number" type="text" value={formData.horse_passport_number} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_weight_kg">Weight (kg):</label>
                            <input className="inputText" id="horse_weight_kg" name="horse_weight_kg" type="text" value={formData.horse_weight_kg} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_last_weighed">Last Weighed:</label>
                            <input className="inputText" id="horse_last_weighed" name="horse_last_weighed" type="date" value={formData.horse_last_weighed} onChange={handleChange} />
                        </div>
                    </section>

                    {/* SECTION 2: VETERINARY */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Veterinary Details</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_vet_name">Vet Name:</label>
                            <input className="inputText" id="horse_vet_name" name="horse_vet_name" type="text" value={formData.horse_vet_name} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_vet_practice">Vet Practice:</label>
                            <input className="inputText" id="horse_vet_practice" name="horse_vet_practice" type="text" value={formData.horse_vet_practice} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="horse_vet_phone_one">Vet Phone:</label>
                            <input className="inputText" id="horse_vet_phone_one" name="horse_vet_phone_one" type="text" value={formData.horse_vet_phone_one} onChange={handleChange} />
                        </div>

                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="horse_medication">Current Medication</label>
                            <textarea className="inputText" id="horse_medication" name="horse_medication" value={formData.horse_medication} onChange={handleChange} />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="horse_allergies">Allergies</label>
                            <textarea className="inputText" id="horse_allergies" name="horse_allergies" value={formData.horse_allergies} onChange={handleChange} />
                        </div>
                    </section>

                    {/* SECTION 3: FARRIER */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Farrier Log</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_name">Farrier Name:</label>
                            <input className="inputText" id="farrier_name" name="farrier_name" type="text" value={formData.farrier_name} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_phone_one">Phone:</label>
                            <input className="inputText" id="farrier_phone_one" name="farrier_phone_one" type="text" value={formData.farrier_phone_one} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_email">Email:</label>
                            <input className="inputText" id="farrier_email" name="farrier_email" type="email" value={formData.farrier_email} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_last_visit">Last Visit:</label>
                            <input className="inputText" id="farrier_last_visit" name="farrier_last_visit" type="date" value={formData.farrier_last_visit} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="farrier_next_visit">Next Visit:</label>
                            <input className="inputText" id="farrier_next_visit" name="farrier_next_visit" type="date" value={formData.farrier_next_visit} onChange={handleChange} />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="farrier_notes">Structural Notes</label>
                            <textarea className="inputText" id="farrier_notes" name="farrier_notes" value={formData.farrier_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* SECTION 4: DENTIST */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Equine Dentist Log</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_name">Dentist Name:</label>
                            <input className="inputText" id="dentist_name" name="dentist_name" type="text" value={formData.dentist_name} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_phone_one">Phone:</label>
                            <input className="inputText" id="dentist_phone_one" name="dentist_phone_one" type="text" value={formData.dentist_phone_one} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_email">Email:</label>
                            <input className="inputText" id="dentist_email" name="dentist_email" type="email" value={formData.dentist_email} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_last_visit">Last Exam:</label>
                            <input className="inputText" id="dentist_last_visit" name="dentist_last_visit" type="date" value={formData.dentist_last_visit} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="dentist_next_visit">Next Appt:</label>
                            <input className="inputText" id="dentist_next_visit" name="dentist_next_visit" type="date" value={formData.dentist_next_visit} onChange={handleChange} />
                        </div>
                        <div className="form-field-row-mixed">
                            <label className="text-normal" htmlFor="dentist_notes">Treatment Notes</label>
                            <textarea className="inputText" id="dentist_notes" name="dentist_notes" value={formData.dentist_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* SECTION 5: FEED & INSTRUCTIONS */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">
                            <label htmlFor="feed_instructions">Feeding & Turnout Instructions</label>
                        </h2>
                        <textarea className="textarea-standalone" id="feed_instructions" name="feed_instructions" value={formData.feed_instructions} onChange={handleChange} />
                    </section>

                    {/* SPACER */}
                    <div className="form-content-spacer"></div>

                    {/* STICKY ACTIONS BAR CONTAINER */}
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