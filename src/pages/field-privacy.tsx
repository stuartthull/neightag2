import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import withSubscriptionProtection from '../components/with-subscription-protection';

function FieldPrivacy() {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const navigate = useNavigate();
    const [horseName, setHorseName] = useState('');
    const [privacy, setPrivacy] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<string>('');

    useEffect(() => {
        const fetchPrivacySettings = async () => {
            if (!horse_uuid) {
                console.error('Missing Horse UUID parameter context.');
                navigate('/dashboard');
                return;
            }

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                navigate('/login');
                return;
            }

            setCurrentUserId(user.id);

            // 1. Fetch horse details to get horse_name AND user_uuid
            const { data: horse, error: horseError } = await supabase
                .from('equi_log_main')
                .select('horse_name, user_uuid')
                .eq('horse_uuid', horse_uuid)
                .eq('user_uuid', user.id)
                .single();

            if (horseError || !horse) {
                console.error('Could not trace horse records:', horseError?.message);
                navigate('/dashboard');
                return;
            }

            setHorseName(horse.horse_name);
            const ownerId = horse.user_uuid;

            // 2. Fetch privacy settings row using horse_uuid
            let { data: settings } = await supabase
                .from('equi_log_show')
                .select('*')
                .eq('horse_uuid', horse_uuid)
                .eq('user_uuid', user.id)
                .maybeSingle();

            // 3. Fallback Seed: If no row exists, create it using BOTH required IDs
            if (!settings && ownerId) {
                const { data: newSettings, error: createError } = await supabase
                    .from('equi_log_show')
                    .insert({
                        horse_uuid: horse_uuid,
                        user_uuid: ownerId,
                    })
                    .select()
                    .single();

                if (!createError) {
                    settings = newSettings;
                } else {
                    console.error('Failed to seed fallback matrix rows:', createError.message);
                }
            }

            setPrivacy(settings);
            setLoading(false);
        };

        fetchPrivacySettings();
    }, [horse_uuid, navigate]);

    const toggleField = async (columnName: string) => {
        if (!privacy || !horse_uuid) return;
        if (!currentUserId) return;

        const nextValue = !privacy[columnName];

        // 1. Optimistic Update (Changes the switch instantly in UI)
        setPrivacy((prev: any) => ({ ...prev, [columnName]: nextValue }));

        console.log(
            `Attempting to save: Setting ${columnName} to ${nextValue} for horse UUID ${horse_uuid}`
        );

        // 2. Perform Mutation Call targeting the horse_uuid column
        const { error, status, statusText } = await supabase
            .from('equi_log_show')
            .update({ [columnName]: nextValue })
            .eq('horse_uuid', horse_uuid)
            .eq('user_uuid', currentUserId);

        // 3. Error Diagnostics Handler
        if (error) {
            console.error('Supabase Privacy Save Error Context:', {
                errorCode: error.code,
                errorMessage: error.message,
                errorDetails: error.details,
                httpStatus: status,
                httpStatusText: statusText,
            });

            alert(`Failed to save: ${error.message || 'Check browser console for RLS errors.'}`);

            // Rollback UI instantly if database rejects the write
            setPrivacy((prev: any) => ({ ...prev, [columnName]: !nextValue }));
        } else {
            console.log(`Successfully persisted ${columnName} state change to cloud store!`);
        }
    };

    if (loading)
        return (
            <div className="page-wrapper">
                <div className="page-container">
                    <section className="section-container purple-section-container">
                        <h1 className="textmedium">Loading Privacy Map...</h1>
                    </section>
                </div>
            </div>
        );

    // 🗺️ Categorized Sections Structured Object Map
    const fieldSections = [
        {
            sectionTitle: 'Basic Identity & Data',
            items: [
                { label: 'Horse Name', key: 'show_name' },
                { label: 'Breed / Pedigree Type', key: 'show_breed' },
                { label: 'Coat Colour', key: 'show_colour' },
                { label: 'Height (hh)', key: 'show_height' },
                { label: 'Weight Metrics (kg)', key: 'show_weight' },
                { label: 'Date of Birth / Age', key: 'show_dob' },
                { label: 'Passport Number', key: 'show_passport' },
                { label: 'Last Date Weighed', key: 'show_last_weighed' },
            ],
        },
        {
            sectionTitle: 'Emergency Protocols',
            items: [
                { label: 'Primary Emergency Name', key: 'show_emergency_name_one' },
                { label: 'Primary Emergency Phone', key: 'show_emergency_phone_one' },
                { label: 'Secondary Emergency Contact Name', key: 'show_emergency_name_two' },
                { label: 'Secondary Emergency Contact Phone', key: 'show_emergency_phone_two' },
            ],
        },
        {
            sectionTitle: 'Veterinary',
            items: [
                { label: 'Vet Name', key: 'show_vet_name' },
                { label: 'Vet Clinic / Practice', key: 'show_vet_practice' },
                { label: 'Vet Primary Phone', key: 'show_vet_phone' },
                { label: 'Active Medications Log', key: 'show_medication' },
                { label: 'Allergy Records & Alerts', key: 'show_allergies' },
            ],
        },
        {
            sectionTitle: 'Care, Stable, & Management',
            items: [{ label: 'Diet & Feeding Instructions', key: 'show_feeding' }],
        },
        {
            sectionTitle: 'Farrier History',
            items: [
                { label: 'Farrier Name', key: 'show_farrier_name' },
                { label: 'Farrier Contact Phone', key: 'show_farrier_phone_one' },
                { label: 'Farrier Next Appointment Due', key: 'show_farrier_next' },
                { label: 'Farrier Technical Shoe/Trim Notes', key: 'show_farrier_notes' },
            ],
        },
        {
            sectionTitle: 'Dental History',
            items: [
                { label: 'Dentist Name', key: 'show_dentist_name' },
                { label: 'Dentist Contact Phone', key: 'show_dentist_phone' },
                { label: 'Dental Next Exam Due Date', key: 'show_dentist_next' },
                { label: 'Dental Pathology Notes', key: 'show_dentist_notes' },
            ],
        },
        {
            sectionTitle: 'Physiotherapist History',
            items: [
                { label: 'Physiotherapist Name', key: 'show_physio_name' },
                { label: 'Physiotherapist Contact Phone', key: 'show_physio_phone' },
                { label: 'Physiotherapist Next Appointment Due', key: 'show_physio_next' },
                { label: 'Physiotherapist Notes', key: 'show_physio_notes' },
            ],
        },
        {
            sectionTitle: 'Saddle Fitter History',
            items: [
                { label: 'Saddle Fitter Name', key: 'show_saddle_fitter_name' },
                { label: 'Saddle Fitter Contact Phone', key: 'show_saddle_fitter_phone' },
                { label: 'Saddle Fitter Next Appointment Due', key: 'show_saddle_fitter_next' },
                { label: 'Saddle Fitter Notes', key: 'show_saddle_fitter_notes' },
            ],
        },
    ];

    return (
        <div className="page-wrapper">
            <div className="page-container">
                <section className="section-container purple-section-container">
                    <button
                        onClick={() => navigate(-1)}
                        className="buttonWhite buttonMain"
                        style={{ marginBottom: '20px' }}
                    >
                        ← Back to Your Stable
                    </button>
                    <h1 className="textbig">Public Display Matrix</h1>
                    <p className="text-normal">
                        Control exactly what details the public can see for{' '}
                        <strong>{horseName}</strong>.
                    </p>
                </section>

                <section className="section-container white-section-container">
                    <h2
                        className="textmedium"
                        style={{
                            marginBottom: '24px',
                            borderBottom: '2px solid #f1f5f9',
                            paddingBottom: '12px',
                        }}
                    >
                        Visibility Settings
                    </h2>

                    {/* 🔄 Double Map Loop processing structured Section containers */}
                    {fieldSections.map((section, idx) => (
                        <div key={`section-${idx}`} style={{ marginBottom: '48px' }}>
                            {/* Section Header Title Banner */}
                            <h3 className="textbig">{section.sectionTitle}</h3>

                            {/* Category setting cards array mapping row loop */}
                            {section.items.map((field) => (
                                <div key={field.key} className="visibility-settings marginbsixteen">
                                    <div>
                                        <div className="textmedium">{field.label}</div>
                                        <div>
                                            {privacy?.[field.key] ? (
                                                <span className="visible-note">
                                                    🌐 Visible to everyone
                                                </span>
                                            ) : (
                                                <span className="visible-note-not">
                                                    🔒 Hidden from public view
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="switchwidth">
                                        <label className="switch">
                                            <input
                                                type="checkbox"
                                                checked={privacy?.[field.key] || false}
                                                onChange={() => toggleField(field.key)}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}

export default withSubscriptionProtection(FieldPrivacy, { requireAuthentication: true });
