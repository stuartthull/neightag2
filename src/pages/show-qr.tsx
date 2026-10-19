import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';

const SITE_URL = 'https://www.neightag.com';

export default function ShowQr(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const [horseName, setHorseName] = useState<string | null>(null);
    const [emergencyContactName, setEmergencyContactName] = useState<string | null>(null);
    const [horseImageUrl, setHorseImageUrl] = useState<string | null>(null);
    const qrValue = `${SITE_URL}/horse-details/${horse_uuid || ''}`;
    const feedsQrValue = `${qrValue}#feeds`;
    const farrierQrValue = `${SITE_URL}/calendar/farrier/${horse_uuid || ''}/add`;

    useEffect(() => {
        if (!horse_uuid) return;

        supabase
            .from('equi_log_main')
            .select('horse_name, horse_image_url, emergency_name_one')
            .eq('horse_uuid', horse_uuid)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Could not load horse image:', error.message);
                    return;
                }

                setHorseName(data?.horse_name ?? null);
                setEmergencyContactName(data?.emergency_name_one ?? null);
                setHorseImageUrl(data?.horse_image_url ?? null);
            });
    }, [horse_uuid]);

    return (
        <main className="page-wrapper">
            <Helmet>
                <title>QR Code | NeighTag</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="page-container">
                <section className="section-container white-section-container text-center">
                    <h1 className="textbig">QR Code</h1>
                    {horse_uuid ? (
                        <>
                            <p className="text-normal">
                                <strong>Horse:</strong> {horseName || 'Horse details unavailable'}
                            </p>
                            <p className="text-normal marginbsixteen">
                                <strong>First emergency contact:</strong>{' '}
                                {emergencyContactName?.trim() || 'Not set'}
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                {horseImageUrl && (
                                    <img
                                        src={horseImageUrl}
                                        alt={`${horseName || 'Horse'} profile`}
                                        style={{ width: '280px', height: '280px', objectFit: 'cover', borderRadius: '4px', flex: '0 0 280px' }}
                                    />
                                )}
                                <div style={{ flex: '0 0 280px', textAlign: 'center' }}>
                                    <p className="text-normal">Horse profile</p>
                                    <QRCodeSVG
                                        value={qrValue}
                                        size={280}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="L"
                                        role="img"
                                        aria-label="Horse profile QR code"
                                    />
                                </div>
                                <div style={{ flex: '0 0 280px', textAlign: 'center' }}>
                                    <p className="text-normal">Feeds &amp; Turnout</p>
                                    <QRCodeSVG
                                        value={feedsQrValue}
                                        size={280}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="L"
                                        role="img"
                                        aria-label="Feeds and turnout QR code"
                                    />
                                </div>
                                <div style={{ flex: '0 0 280px', textAlign: 'center' }}>
                                    <p className="text-normal">Farrier Appointment</p>
                                    <QRCodeSVG
                                        value={farrierQrValue}
                                        size={280}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="L"
                                        role="img"
                                        aria-label="Farrier appointment QR code"
                                    />
                                </div>
                            </div>
                            <p className="text-normal">
                                <a href={qrValue}>Horse profile: {qrValue}</a>
                            </p>
                            <p className="text-normal">
                                <a href={feedsQrValue}>Feeds &amp; Turnout: {feedsQrValue}</a>
                            </p>
                            <p className="text-normal">
                                <a href={farrierQrValue}>Farrier appointment: {farrierQrValue}</a>
                            </p>
                        </>
                    ) : (
                        <p className="text-normal">No horse id was provided.</p>
                    )}
                </section>
            </div>
        </main>
    );
}
