import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function FieldPrivacy() {
    // ✅ Updated to cleanly match the unified horse_uuid param token context
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const navigate = useNavigate();
    const [horseName, setHorseName] = useState('');
    const [privacy, setPrivacy] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPrivacySettings = async () => {
            if (!horse_uuid) {
                console.error("Missing Horse UUID parameter context.");
                navigate('/dashboard');
                return;
            }

            // 1. Fetch horse name using horse_uuid
            const { data: horse } = await supabase
                .from('equi_log_main')
                .select('horse_name')
                .eq('horse_uuid', horse_uuid)
                .single();

            if (horse) setHorseName(horse.horse_name);

            // 2. Fetch privacy settings row using horse_uuid
            let { data: settings } = await supabase
                .from('equi_log_show')
                .select('*')
                .eq('horse_uuid', horse_uuid)
                .maybeSingle(); // Swapped to maybeSingle to handle empty seeds cleanly

            if (!settings) {
                // Safe backend database backup creation block matching new tracking keys
                const { data: newSettings, error: createError } = await supabase
                    .from('equi_log_show')
                    .insert({ horse_uuid: horse_uuid })
                    .select()
                    .single();

                if (!createError) {
                    settings = newSettings;
                }
            }

            setPrivacy(settings);
            setLoading(false);
        };

        fetchPrivacySettings();
    }, [horse_uuid, navigate]);

    const toggleField = async (columnName: string) => {
        if (!privacy || !horse_uuid) return;

        const nextValue = !privacy[columnName];

        // 1. Optimistic Update (Changes the switch instantly in UI)
        setPrivacy((prev: any) => ({ ...prev, [columnName]: nextValue }));

        console.log(`Attempting to save: Setting ${columnName} to ${nextValue} for horse UUID ${horse_uuid}`);

        // 2. Perform Mutation Call targeting the horse_uuid column
        const { error, status, statusText } = await supabase
            .from('equi_log_show')
            .update({ [columnName]: nextValue })
            .eq('horse_uuid', horse_uuid);

        // 3. Error Diagnostics Handler
        if (error) {
            console.error("Supabase Privacy Save Error Context:", {
                errorCode: error.code,
                errorMessage: error.message,
                errorDetails: error.details,
                httpStatus: status,
                httpStatusText: statusText
            });

            alert(`Failed to save: ${error.message || 'Check browser console for RLS errors.'}`);

            // Rollback UI instantly if database rejects the write
            setPrivacy((prev: any) => ({ ...prev, [columnName]: !nextValue }));
        } else {
            console.log(`Successfully persisted ${columnName} state change to cloud store!`);
        }
    };

    if (loading) return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container">
                    <h1 className="textmedium">Loading Privacy Map...</h1>
                </section>
            </div>
        </div>
    );

    const fields = [
        // --- BASIC IDENTITY & DATA ---
        { label: "Horse Name", key: "show_name" },
        { label: "Breed / Pedigree Type", key: "show_breed" },
        { label: "Coat Colour", key: "show_colour" },
        { label: "Height (hh)", key: "show_height" },
        { label: "Weight Metrics (kg)", key: "show_weight" },
        { label: "Date of Birth / Age", key: "show_dob" },
        { label: "Passport Number", key: "show_passport" },
        { label: "Last Date Weighed", key: "show_last_weighed" },

        // --- EMERGENCY PROTOCOLS ---
        { label: "Primary Emergency Name", key: "show_emergency_name_one" },
        { label: "Primary Emergency Phone", key: "show_emergency_phone_one" },
        { label: "Secondary Emergency Contact Name", key: "show_emergency_name_two" },
        { label: "Secondary Emergency Contact Phone", key: "show_emergency_phone_two" },

        // --- VETERINARY CARE DEEP DIVE ---
        { label: "Vet Name", key: "show_vet_name" },
        { label: "Vet Clinic / Practice", key: "show_vet_practice" },
        { label: "Vet Primary Phone", key: "show_vet_phone" },
        { label: "Active Medications Log", key: "show_medication" },
        { label: "Allergy Records & Alerts", key: "show_allergies" },

        // --- SADDLE FITTER HISTORY ---
        { label: "Saddle Fitter Name", key: "show_saddle_fitter_name" },
        { label: "Saddle Fitter Contact Phone", key: "show_saddle_fitter_phone" },
        { label: "Saddle Fitter Next Appointment Due", key: "show_saddle_fitter_next" },
        { label: "Saddle Fitter Notes", key: "show_saddle_fitter_notes" },

        // --- PHYSIOTHERAPIST HISTORY ---
        { label: "Physiotherapist Name", key: "show_physio_name" },
        { label: "Physiotherapist Contact Phone", key: "show_physio_phone" },
        { label: "Physiotherapist Next Appointment Due", key: "show_physio_next" },
        { label: "Physiotherapist Notes", key: "show_physio_notes" },

        // --- FARRIER HISTORY ---
        { label: "Farrier Name", key: "show_farrier_name" },
        { label: "Farrier Contact Phone", key: "show_farrier_phone_one" },
        { label: "Farrier Contact Email", key: "show_farrier_email" },
        { label: "Farrier Last Visit Date", key: "show_farrier_last" },
        { label: "Farrier Next Appointment Due", key: "show_farrier_next" },
        { label: "Farrier Technical Shoe/Trim Notes", key: "show_farrier_notes" },

        // --- DENTAL HISTORY ---
        { label: "Dentist Name", key: "show_dentist_name" },
        { label: "Dentist Contact Phone", key: "show_dentist_phone" },
        { label: "Dentist Contact Email", key: "show_dentist_email" },
        { label: "Dental Last Exam Date", key: "show_dentist_last" },
        { label: "Dental Next Appointment Due", key: "show_dentist_next" },
        { label: "Dental Pathology Notes", key: "show_dentist_notes" },

        // --- CARE, STABLE, & MANAGEMENT ---
        { label: "Diet & Feeding Instructions text", key: "show_feeding" },
    ];

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container">
                    <button onClick={() => navigate(-1)} className="buttonWhite buttonMain" style={{ marginBottom: '20px' }}>
                        ← Back
                    </button>
                    <h1 className="textbig">Public Display Matrix</h1>
                    <p className="text-normal">Control exactly what details the public can see for <strong>{horseName}</strong>.</p>
                </section>

                <section className="section-container white-section-container">
                    <h2 className="textmedium marginbeight">Visibility Settings</h2>
                    {fields.map(field => (
                        <div key={field.key} className="visibility-settings marginbsixteen">
                            <div>
                                <div className="textmedium">{field.label}</div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                    {privacy?.[field.key] ? "🌐 Visible to everyone" : "🔒 Hidden from public view"}
                                </div>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={privacy?.[field.key] || false}
                                    onChange={() => toggleField(field.key)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}