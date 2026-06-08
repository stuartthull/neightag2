import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface HorseboxData {
    registration: string;
    make_model: string;
    mot_date: string;
    insurance_date: string;
    service_date: string;
    insurance_provider: string;
    insurance_policy_number: string;
    breakdown_provider: string;
    breakdown_policy_number: string;
    breakdown_phone: string;
    general_notes: string;
}

export default function HorseboxView(): React.JSX.Element {
    const navigate = useNavigate();
    const [loading, setLoading] = useState<boolean>(true);
    const [horsebox, setHorsebox] = useState<HorseboxData | null>(null);

    useEffect(() => {
        const fetchHorseboxData = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                navigate('/login');
                return;
            }

            const { data, error } = await supabase
                .from('equi_horsebox')
                .select('*')
                .maybeSingle();

            if (!error && data) {
                setHorsebox(data as HorseboxData);
            }
            setLoading(false);
        };

        fetchHorseboxData();
    }, [navigate]);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not Set';
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) return <div className="page-container" style={{ textAlign: 'center', padding: '40px' }}>Loading Transport Logistics Profile...</div>;

    return (
        <div className="page-wrapper" >
            <div className="page-container">



                {!horsebox ? (
                    <div className="horsebox-empty-card">
                        <h3>No Vehicle Registered</h3>
                        <p>Store your insurance policies, breakdown recovery numbers, and MOT dates right here so you can look them up instantly during a roadside inspection or emergency.</p>
                        <Link to="/horsebox/edit" className="buttonMain buttonPurple" style={{ textDecoration: 'none', display: 'inline-block' }}>
                            Setup Horsebox Profile
                        </Link>
                    </div>
                ) : (
                    <div>
                        <div className="marginbeight">
                            <h1 className="textbig">My Horsebox: {horsebox.make_model || 'Unspecified Model Setup'}</h1>
                            <p className="horsebox-reg-plate">{horsebox.registration || 'NO REG'}</p>
                        </div>
                        <Link to="/horsebox/edit" className="buttonSmall buttonPurple">
                            ✏️ Edit Records
                        </Link>

                        <div className="horsebox-date-grid">
                            <div className="horsebox-date-card">
                                <div className="horsebox-card-icon">🛡️</div>
                                <strong className="horsebox-card-label">Insurance Renewal</strong>
                                <span className="horsebox-card-value">{formatDate(horsebox.insurance_date)}</span>
                            </div>
                            <div className="horsebox-date-card">
                                <div className="horsebox-card-icon">📋</div>
                                <strong className="horsebox-card-label">MOT Expiry Date</strong>
                                <span className="horsebox-card-value">{formatDate(horsebox.mot_date)}</span>
                            </div>
                            <div className="horsebox-date-card">
                                <div className="horsebox-card-icon">⚙️</div>
                                <strong className="horsebox-card-label">Last or Next Service</strong>
                                <span className="horsebox-card-value">{formatDate(horsebox.service_date)}</span>
                            </div>
                        </div>

                        <div className="horsebox-panel breakdown-panel">
                            <h3>Insurance Record Details</h3>
                            <div className="horsebox-data-list">
                                <div><span>Provider:</span> <strong>{horsebox.insurance_provider || 'Not documented'}</strong></div>
                                <div><span>Policy Number:</span> <strong>{horsebox.insurance_policy_number || 'Not documented'}</strong></div>
                            </div>
                        </div>
                        <div className="horsebox-panel breakdown-panel">
                            <h3>🚨 Breakdown Recovery Support</h3>
                            <div className="horsebox-data-list">
                                <div><span>Provider:</span> <strong>{horsebox.breakdown_provider || 'Not documented'}</strong></div>
                                <div><span>Policy Number:</span> <strong>{horsebox.breakdown_policy_number || 'Not documented'}</strong></div>
                                {horsebox.breakdown_phone && (
                                    <div>
                                        <a href={`tel:${horsebox.breakdown_phone}`} className="horsebox-call-button">
                                            📞 Call recovery: {horsebox.breakdown_phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {horsebox.general_notes && (
                            <div className="horsebox-notes-panel">
                                <h3>Additional Maintenance & Equipment Notes</h3>
                                <p className="horsebox-notes-text">{horsebox.general_notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}