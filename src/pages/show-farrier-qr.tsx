import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Helmet } from 'react-helmet-async';
import { supabase } from '../supabaseClient';

const SITE_URL = 'https://www.neightag.com';

export default function ShowFarrierQr(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const [horseName, setHorseName] = useState<string | null>(null);
    const [horseImageUrl, setHorseImageUrl] = useState<string | null>(null);
    const qrValue = `${SITE_URL}/calendar/farrier/${horse_uuid || ''}/add`;

    useEffect(() => {
        if (!horse_uuid) return;

        supabase
            .from('equi_log_main')
            .select('horse_name, horse_image_url')
            .eq('horse_uuid', horse_uuid)
            .maybeSingle()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Could not load horse details for farrier QR:', error.message);
                    return;
                }

                setHorseName(data?.horse_name ?? null);
                setHorseImageUrl(data?.horse_image_url ?? null);
            });
    }, [horse_uuid]);

    return (
        <main className="page-wrapper">
            <Helmet>
                <title>Farrier Appointment QR Code | NeighTag</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <div className="page-container">
                <section className="section-container white-section-container text-center">
                    <h1 className="textbig">Farrier Appointment QR Code</h1>
                    {horse_uuid ? (
                        <>
                            <p className="text-normal marginbsixteen">
                                Scan to open the farrier appointment form for{' '}
                                <strong>{horseName || 'this horse'}</strong>.
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                {horseImageUrl && (
                                    <img
                                        src={horseImageUrl}
                                        alt={`${horseName || 'Horse'} profile`}
                                        style={{ width: '280px', height: '280px', objectFit: 'cover', borderRadius: '4px', flex: '0 0 280px' }}
                                    />
                                )}
                                <div style={{ width: '280px', height: '280px', flex: '0 0 280px' }}>
                                    <QRCodeSVG
                                        value={qrValue}
                                        size={280}
                                        bgColor="#ffffff"
                                        fgColor="#000000"
                                        level="H"
                                        role="img"
                                        aria-label="Farrier appointment form QR code"
                                    />
                                </div>
                            </div>
                            <p className="text-normal">
                                <a href={qrValue}>{qrValue}</a>
                            </p>
                            <p className="text-normal">
                                The request will be sent to the horse owner for approval before it is added to the calendar.
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