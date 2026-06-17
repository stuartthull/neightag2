import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function HorseboxEdit(): React.JSX.Element {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [saving, setSaving] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | null>(null);

    const [registration, setRegistration] = useState<string>('');
    const [makeModel, setMakeModel] = useState<string>('');
    const [motDate, setMotDate] = useState<string>('');
    const [insuranceDate, setInsuranceDate] = useState<string>('');
    const [serviceDate, setServiceDate] = useState<string>('');
    const [insProvider, setInsProvider] = useState<string>('');
    const [insPolicy, setInsPolicy] = useState<string>('');
    const [bdProvider, setBdProvider] = useState<string>('');
    const [bdPolicy, setBdPolicy] = useState<string>('');
    const [bdPhone, setBdPhone] = useState<string>('');
    const [notes, setNotes] = useState<string>('');

    useEffect(() => {
        const loadExistingProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }
            setUserId(session.user.id);

            const { data, error } = await supabase
                .from('equi_horsebox')
                .select('*')
                .maybeSingle();

            if (!error && data) {
                setRegistration(data.registration || '');
                setMakeModel(data.make_model || '');
                setMotDate(data.mot_date || '');
                setInsuranceDate(data.insurance_date || '');
                setServiceDate(data.service_date || '');
                setInsProvider(data.insurance_provider || '');
                setInsPolicy(data.insurance_policy_number || '');
                setBdProvider(data.breakdown_provider || '');
                setBdPolicy(data.breakdown_policy_number || '');
                setBdPhone(data.breakdown_phone || '');
                setNotes(data.general_notes || '');
            }
            setLoading(false);
        };

        loadExistingProfile();
    }, [navigate]);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        if (!userId) return;
        setSaving(true);

        const payload = {
            user_uuid: userId,
            registration: registration.trim().toUpperCase(),
            make_model: makeModel.trim(),
            mot_date: motDate || null,
            insurance_date: insuranceDate || null,
            service_date: serviceDate || null,
            insurance_provider: insProvider.trim(),
            insurance_policy_number: insPolicy.trim(),
            breakdown_provider: bdProvider.trim(),
            breakdown_policy_number: bdPolicy.trim(),
            breakdown_phone: bdPhone.trim(),
            general_notes: notes.trim(),
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('equi_horsebox')
            .upsert(payload, { onConflict: 'user_uuid' });

        setSaving(false);

        if (error) {
            alert(`Failed to save vehicle details: ${error.message}`);
        } else {
            navigate('/dashboard');
        }
    };

    if (loading) return <div className="page-container" style={{ textAlign: 'center', padding: '40px' }}>Syncing Horsebox Forms...</div>;

    return (
        <div className="page-wrapper" >
            <div className="page-container">

                <form onSubmit={handleSave} className="horsebox-form">

                    <section className="section-container purple-section-container">
                        <button type="button" onClick={() => navigate('/dashboard')} className="buttonWhite buttonMain marginbsixteen">
                            ← Back to Dashboard
                        </button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                            <div>
                                <h1 className="textbig">Edit Transport Logistics Profiles</h1>
                            </div>
                        </div>

                        <div className="horsebox-form-grid-2">
                            <div className="horsebox-field-group">
                                <label>Registration Mark</label>
                                <input type="text" value={registration} onChange={e => setRegistration(e.target.value)} placeholder="E.g. AB12 CDE" />
                            </div>
                            <div className="horsebox-field-group">
                                <label>Make & Model</label>
                                <input type="text" value={makeModel} onChange={e => setMakeModel(e.target.value)} placeholder="E.g. Ifor Williams HB511" />
                            </div>
                        </div>
                    </section>


                    <section className="section-container white-section-container">
                    <h3 className="textmedium">Compliance Deadlines</h3>
                    <div className="horsebox-form-grid-1">
                        <div className="horsebox-field-group marginbsixteen">
                            <label>Insurance Expiry</label>
                            <input type="date" value={insuranceDate} onChange={e => setInsuranceDate(e.target.value)} />
                        </div>
                        <div className="horsebox-field-group marginbsixteen">
                            <label>MOT Expiry</label>
                            <input type="date" value={motDate} onChange={e => setMotDate(e.target.value)} />
                        </div>
                        <div className="horsebox-field-group marginbsixteen">
                            <label>Vehicle Service</label>
                            <input type="date" value={serviceDate} onChange={e => setServiceDate(e.target.value)} />
                        </div>
                    </div>
                    </section>
                    <section className="section-container white-section-container">
                            <h3 className="textmedium">Insurance</h3>

                            <div className="horsebox-field-group">
                                <label htmlFor="insProvider" className="horsebox-form-label">
                                    Insurance Provider Underwriter
                                </label>
                                <input
                                    type="text"
                                    id="insProvider"
                                    value={insProvider}
                                    onChange={e => setInsProvider(e.target.value)}
                                    className="form-input-control"
                                    placeholder="e.g., NFU Mutual"
                                />
                            </div>

                            <div className="horsebox-field-group">
                                <label htmlFor="insPolicy" className="horsebox-form-label">
                                    Policy Reference Number
                                </label>
                                <input
                                    type="text"
                                    id="insPolicy"
                                    value={insPolicy}
                                    onChange={e => setInsPolicy(e.target.value)}
                                    className="form-input-control"
                                    placeholder="e.g., HP-98421-X"
                                />
                            </div>
                    </section>
                        <section className="section-container white-section-container">
                            <h3 className="textmedium">Roadside Breakdown Assistance</h3>

                            <div className="horsebox-field-group">
                                <label htmlFor="bdProvider" className="horsebox-form-label">
                                    Breakdown Recovery Provider
                                </label>
                                <input
                                    type="text"
                                    id="bdProvider"
                                    value={bdProvider}
                                    onChange={e => setBdProvider(e.target.value)}
                                    className="form-input-control"
                                    placeholder="e.g., Equine Rescue Services"
                                />
                            </div>

                            <div className="horsebox-field-group">
                                <label htmlFor="bdPolicy" className="horsebox-form-label">
                                    Member Association ID
                                </label>
                                <input
                                    type="text"
                                    id="bdPolicy"
                                    value={bdPolicy}
                                    onChange={e => setBdPolicy(e.target.value)}
                                    className="form-input-control"
                                    placeholder="e.g., ERS-M-5510"
                                />
                            </div>

                            <div className="horsebox-field-group">
                                <label htmlFor="bdPhone" className="horsebox-form-label">
                                    Emergency Hotline Phone
                                </label>
                                <input
                                    type="tel"
                                    id="bdPhone"
                                    value={bdPhone}
                                    onChange={e => setBdPhone(e.target.value)}
                                    className="form-input-control"
                                    autoComplete="tel"
                                    placeholder="e.g., 07700 900077"
                                />
                            </div>
                    </section>
                    <section className="section-container white-section-container">
                        <h3 className="horsebox-form-section-title marginbsixteen">Horsebox Extras</h3>

                    <div className="horsebox-field-group margintsixteen">
                        <label>Notes</label>
                        <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Tyre pressure specs, lockbox codes..." style={{ minHeight: '100px' }} />
                    </div>
                    </section>
                    <div className="sticky-actions-bar">
                        <button type="submit" disabled={saving} className="buttonMain buttonPurple">
                            {saving ? 'Saving updates to profile context...' : 'Save Horsebox Logistics Information'}
                        </button>
                    </div>
                </form>
            </div>
        </div >
    );
}