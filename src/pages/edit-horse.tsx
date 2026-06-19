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
    farrier_next_visit: '', // 🗓️ Populated via equi_calendar
    farrier_notes: '',
    horse_breed: '',
    horse_colour: '',
    horse_height: '',
    dentist_name: '',
    dentist_phone_one: '',
    dentist_email: '',
    dentist_next_visit: '', // 🗓️ Populated via equi_calendar
    dentist_notes: '',
    emergency_name_one: '',
    emergency_phone_one: '',
    emergency_name_two: '',
    emergency_phone_two: '',
    feed_instructions: '',
    saddle_fitter_name: '',
    saddle_fitter_phone: '',
    saddle_fitter_next_visit: '', // 🗓️ Populated via equi_calendar
    saddle_fitter_notes: '',
    physio_name: '',
    physio_phone: '',
    physio_next_visit: '', // 🗓️ Populated via equi_calendar
    physio_notes: '',
    horse_image_url: ''
};

export default function EditItem(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState<any>(INITIAL_FORM_DATA);
    const [originalData, setOriginalData] = useState<any>(INITIAL_FORM_DATA);
    const [isUpdatingPrivacy, setIsUpdatingPrivacy] = useState(false);

    const normalizeDate = (dateVal: any): string => {
        if (!dateVal) return '';
        const dateStr = String(dateVal).trim();
        return dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.substring(0, 10);
    };

    useEffect(() => {
        const fetchCoreVitals = async () => {
            if (!horse_uuid) {
                console.error("No horse_uuid parameter identified in the current layout context.");
                navigate('/dashboard');
                return;
            }

            // 1. Fetch main profile data
            const { data: horseData, error: horseError } = await supabase
                .from('equi_log_main')
                .select('*')
                .eq('horse_uuid', horse_uuid)
                .single();

            if (horseError) {
                console.error("Error fetching core log payload:", horseError);
                navigate('/dashboard');
                return;
            }

            // 2. 🗓️ Fetch calendar schedules matching this exact horse
            const { data: calData, error: calError } = await supabase
                .from('equi_calendar')
                .select('calendar_title, calendar_date')
                .eq('horse_uuid', horse_uuid);

            const calendarMap: any = {};
            if (!calError && calData) {
                calData.forEach((event: any) => {
                    calendarMap[event.calendar_title] = normalizeDate(event.calendar_date);
                });
            }

            const safePayload: any = {};
            Object.keys(horseData || {}).forEach(key => {
                if (key in INITIAL_FORM_DATA || key === 'user_uuid' || key === 'horse_uuid') {
                    if (key === 'is_public') {
                        safePayload[key] = horseData[key] ?? true;
                    } else {
                        if (key === 'horse_dob' || key === 'horse_last_weighed') {
                            safePayload[key] = horseData[key] ? normalizeDate(horseData[key]) : '';
                        } else {
                            safePayload[key] = horseData[key] === null ? '' : horseData[key];
                        }
                    }
                }
            });

            // Map database calendar dates explicitly back into local state signatures
            safePayload['farrier_next_visit'] = calendarMap['Farrier Visit'] || '';
            safePayload['dentist_next_visit'] = calendarMap['Dentist Visit'] || '';
            safePayload['saddle_fitter_next_visit'] = calendarMap['Saddle Fitter Visit'] || '';
            safePayload['physio_next_visit'] = calendarMap['Physio Visit'] || '';

            const loadedData = { ...INITIAL_FORM_DATA, ...safePayload };
            setFormData(loadedData);
            setOriginalData(loadedData);
            setLoading(false);
        };

        fetchCoreVitals();
    }, [horse_uuid, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePrivacyToggle = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPublicStatus = e.target.checked;
        setFormData(prev => ({ ...prev, is_public: newPublicStatus }));
        setIsUpdatingPrivacy(true);

        const { error } = await supabase
            .from('equi_log_main')
            .update({ is_public: newPublicStatus })
            .eq('horse_uuid', horse_uuid);

        setIsUpdatingPrivacy(false);
        if (error) {
            setFormData(prev => ({ ...prev, is_public: !newPublicStatus }));
            alert("Failed to update privacy setting: " + error.message);
        }
    };

    // 🗓️ Core Sync Logic adapted cleanly to map against your schema rules
    const syncAppointmentsToCalendar = async (current: any, original: any) => {
        const ownerUuid = current.user_uuid || original.user_uuid;
        if (!ownerUuid || !horse_uuid) return;

        const appointmentTypes = [
            { key: 'farrier_next_visit', title: 'Farrier Visit', notes: current.farrier_notes },
            { key: 'dentist_next_visit', title: 'Dentist Visit', notes: current.dentist_notes },
            { key: 'saddle_fitter_next_visit', title: 'Saddle Fitter Visit', notes: current.saddle_fitter_notes },
            { key: 'physio_next_visit', title: 'Physio Visit', notes: current.physio_notes }
        ];

        for (const appt of appointmentTypes) {
            const newDate = normalizeDate(current[appt.key]);
            const oldDate = normalizeDate(original[appt.key]);

            if (newDate !== oldDate) {
                if (newDate) {
                    // Match correct public schema column structure
                    const { error } = await supabase
                        .from('equi_calendar')
                        .upsert({
                            user_uuid: ownerUuid,
                            horse_uuid: horse_uuid,
                            calendar_date: newDate,
                            calendar_title: appt.title,
                            calendar_notes: appt.notes || ''
                        }, {
                            onConflict: 'horse_uuid,calendar_title' // ✅ Matches schema composite constraint key rule
                        });

                    if (error) console.error(`Error saving ${appt.title}:`, error.message);
                } else {
                    // Remove record cleanly if date input cleared completely
                    const { error } = await supabase
                        .from('equi_calendar')
                        .delete()
                        .eq('horse_uuid', horse_uuid)
                        .eq('calendar_title', appt.title);

                    if (error) console.error(`Error dropping ${appt.title}:`, error.message);
                }
            }
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const vitalsPayload: any = { ...formData };

        // Drop out fields not supported inside your equi_log_main schema columns
        const calendarFields = [
            'farrier_next_visit', 'dentist_next_visit',
            'saddle_fitter_next_visit', 'physio_next_visit',
            'user_uuid', 'horse_uuid', 'id'
        ];
        calendarFields.forEach(field => delete vitalsPayload[field]);

        Object.keys(vitalsPayload).forEach(key => {
            if (vitalsPayload[key] === '') vitalsPayload[key] = null;
        });

        const { error } = await supabase
            .from('equi_log_main')
            .update(vitalsPayload)
            .eq('horse_uuid', horse_uuid);

        if (error) {
            alert("Database Error: " + error.message);
        } else {
            await syncAppointmentsToCalendar(formData, originalData);
            alert("Changes saved cleanly!");
            navigate('/dashboard');
        }
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            alert("Please upload a valid image file (.jpg, .png, or .webp)");
            return;
        }

        const ownerId = formData.user_uuid || originalData.user_uuid;

        if (!ownerId) {
            alert("Error: Could not verify owner account ID. Please refresh and try again.");
            return;
        }

        const filePath = `${ownerId}/${horse_uuid}-${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
            .from('horse-photos')
            .upload(filePath, file, { upsert: true });

        if (uploadError) {
            console.error("Upload error:", uploadError.message);
            alert("Failed to upload image to server storage.");
            return;
        }

        const { data: { publicUrl } } = supabase.storage
            .from('horse-photos')
            .getPublicUrl(filePath);

        const { error: dbError } = await supabase
            .from('equi_log_main')
            .update({ horse_image_url: publicUrl })
            .eq('horse_uuid', horse_uuid);

        if (!dbError) {
            setFormData((prev: any) => ({ ...prev, horse_image_url: publicUrl }));
            setOriginalData((prev: any) => ({ ...prev, horse_image_url: publicUrl }));
            alert("Profile photo updated successfully!");
        } else {
            console.error("Database link error:", dbError.message);
        }
    };

    // 🗑️ Clears image relationship fields from storage, state, and db profiles safely
    const handleRemoveImage = async () => {
        if (!window.confirm("Are you sure you want to remove this profile photo?")) return;

        const currentImageUrl = formData.horse_image_url;

        if (currentImageUrl) {
            try {
                // Extract the path after '/horse-photos/' from the public URL
                // Example: "owner_id/horse_id-timestamp.jpg"
                const urlParts = currentImageUrl.split('/horse-photos/');
                if (urlParts.length === 2) {
                    const storagePath = urlParts[1];

                    // 1. Delete the actual file asset from your Supabase bucket
                    const { error: storageError } = await supabase.storage
                        .from('horse-photos')
                        .remove([storagePath]);

                    if (storageError) {
                        console.error("Storage cleanup warning:", storageError.message);
                        // We continue anyway so the user isn't stuck with an un-removable link if the file was already missing
                    }
                }
            } catch (err) {
                console.error("Failed parsing storage key path context:", err);
            }
        }

        // 2. Remove the link reference inside your database record
        const { error: dbError } = await supabase
            .from('equi_log_main')
            .update({ horse_image_url: null })
            .eq('horse_uuid', horse_uuid);

        if (!dbError) {
            setFormData((prev: any) => ({ ...prev, horse_image_url: '' }));
            setOriginalData((prev: any) => ({ ...prev, horse_image_url: '' }));
            alert("Profile photo removed cleanly!");
        } else {
            alert("Failed to update profile record: " + dbError.message);
        }
    };

    if (loading) return (
        <div className="page-wrapper"><div className="page-container"><section className="section-container purple-section-container"><h1 className="textmedium">Populating comprehensive records...</h1></section></div></div>
    );

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <form onSubmit={handleUpdate}>
                    {/* HERO SECTION */}
                    <section className="section-container purple-section-container">
                        <button type="button" onClick={() => navigate('/dashboard')} className="buttonWhite buttonMain marginbsixteen">← Back to Your Stable</button>
                        <div>
                            <h1 className="textbig">Edit {formData.horse_name || 'Unnamed'}'s Record</h1>

                            {/* 📸 PROFILE IMAGE MANAGER PANEL */}
                            <div style={{ marginBottom: '32px', display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <div style={{ position: 'relative' }}>
                                    {formData.horse_image_url ? (
                                        <img
                                            src={formData.horse_image_url}
                                            alt="Horse preview"
                                            style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        <div style={{ backgroundColor: 'white', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>
                                            🐴
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-normal"><strong>Profile Picture</strong></p>

                                    {/* 🎛️ Conditional Template Toggle Engine */}
                                    {formData.horse_image_url ? (
                                        <div>
                                            <p className="text-normal marginbsixteen">✓ Photo uploaded successfully</p>
                                            <button
                                                type="button"
                                                onClick={handleRemoveImage}
                                                className="buttonMain buttonOrange"
                                            >
                                                Remove Photo
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Upload a photo of your horse (.jpg, .png, .webp)</p>
                                            {/* 🏷️ The visible, styled click target */}
                                            <label htmlFor="horse_image_input" className="buttonMain buttonOrange file-upload-button">
                                                Choose Photo
                                            </label>

                                            {/* 📦 The hidden functional input */}
                                            <input
                                                type="file"
                                                id="horse_image_input"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="visually-hidden-file-input"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="white-section-container privacy-toggle-container" style={{ opacity: isUpdatingPrivacy ? 0.6 : 1 }}>
                                <div>
                                    <div className="text-normal"><strong>🌐 Global Public Profile</strong></div>
                                    <p>Turn off to hide your horse's public details</p>
                                    <div className="privacy-toggle-meta">{isUpdatingPrivacy ? "Saving changes..." : formData.is_public ? "Profile is Live" : "Profile is Hidden"}</div>
                                </div>
                                <label className="switch switch-wrapper" htmlFor="is_public">
                                    <input type="checkbox" id="is_public" name="is_public" checked={formData.is_public} onChange={handlePrivacyToggle} disabled={isUpdatingPrivacy} />
                                    <span className="slider round"></span>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* EMERGENCY CONTACTS */}
                    <section className="section-container purple-section-container">
                        <h2 className="textmedium marginbeight">Emergency Contacts</h2>
                        <div className="form-grid-two">
                            <div className="form-grid-card">
                                <p className="text-normal marginbeight"><strong>Primary Contact</strong></p>
                                <input className="inputText marginbeight" placeholder="Name" name="emergency_name_one" type="text" value={formData.emergency_name_one} onChange={handleChange} />
                                <input className="inputText" placeholder="Phone" name="emergency_phone_one" type="text" value={formData.emergency_phone_one} onChange={handleChange} />
                            </div>
                            <div className="form-grid-card">
                                <p className="text-normal marginbeight"><strong>Secondary Contact</strong></p>
                                <input className="inputText marginbeight" placeholder="Name" name="emergency_name_two" type="text" value={formData.emergency_name_two} onChange={handleChange} />
                                <input className="inputText" placeholder="Phone" name="emergency_phone_two" type="text" value={formData.emergency_phone_two} onChange={handleChange} />
                            </div>
                        </div>
                    </section>

                    {/* IDENTITY & PROFILE */}
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

                    {/* VETERINARY */}
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

                    {/* SADDLE FITTER */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Saddle Fitter Details</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="saddle_fitter_name">Fitter Name:</label>
                            <input className="inputText" id="saddle_fitter_name" name="saddle_fitter_name" type="text" value={formData.saddle_fitter_name} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="saddle_fitter_phone">Phone:</label>
                            <input className="inputText" id="saddle_fitter_phone" name="saddle_fitter_phone" type="text" value={formData.saddle_fitter_phone} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="saddle_fitter_next_visit">Next Visit:</label>
                            <input className="inputText" id="saddle_fitter_next_visit" name="saddle_fitter_next_visit" type="date" value={formData.saddle_fitter_next_visit} onChange={handleChange} />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="saddle_fitter_notes">Saddle Notes</label>
                            <textarea className="inputText" id="saddle_fitter_notes" name="saddle_fitter_notes" value={formData.saddle_fitter_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* PHYSIOTHERAPIST */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen">Physiotherapist Details</h2>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="physio_name">Physio Name:</label>
                            <input className="inputText" id="physio_name" name="physio_name" type="text" value={formData.physio_name} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="physio_phone">Phone:</label>
                            <input className="inputText" id="physio_phone" name="physio_phone" type="text" value={formData.physio_phone} onChange={handleChange} />
                        </div>
                        <div className="text-normal marginbeight form-field-row">
                            <label htmlFor="physio_next_visit">Next Visit:</label>
                            <input className="inputText" id="physio_next_visit" name="physio_next_visit" type="date" value={formData.physio_next_visit} onChange={handleChange} />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="physio_notes">Physio Notes</label>
                            <textarea className="inputText" id="physio_notes" name="physio_notes" value={formData.physio_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* FARRIER */}
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
                            <label htmlFor="farrier_next_visit">Next Visit:</label>
                            <input className="inputText" id="farrier_next_visit" name="farrier_next_visit" type="date" value={formData.farrier_next_visit} onChange={handleChange} />
                        </div>
                        <div className="textarea-block-group form-field-row-mixed">
                            <label className="text-normal" htmlFor="farrier_notes">Structural Notes</label>
                            <textarea className="inputText" id="farrier_notes" name="farrier_notes" value={formData.farrier_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* DENTIST */}
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
                            <label htmlFor="dentist_next_visit">Next Appt:</label>
                            <input className="inputText" id="dentist_next_visit" name="dentist_next_visit" type="date" value={formData.dentist_next_visit} onChange={handleChange} />
                        </div>
                        <div className="form-field-row-mixed">
                            <label className="text-normal" htmlFor="dentist_notes">Treatment Notes</label>
                            <textarea className="inputText" id="dentist_notes" name="dentist_notes" value={formData.dentist_notes} onChange={handleChange} />
                        </div>
                    </section>

                    {/* FEED & INSTRUCTIONS */}
                    <section className="section-container white-section-container">
                        <h2 className="textmedium marginbsixteen"><label htmlFor="feed_instructions">Feeding & Turnout Instructions</label></h2>
                        <textarea className="textarea-standalone" id="feed_instructions" name="feed_instructions" value={formData.feed_instructions} onChange={handleChange} />
                    </section>

                    <div className="form-content-spacer"></div>
                    <div className="sticky-actions-bar">
                        <button type="submit" className="buttonMain buttonOrange">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
}