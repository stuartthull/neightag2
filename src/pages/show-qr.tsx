import React from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Helmet } from 'react-helmet-async';

const SITE_URL = 'https://www.neightag.com';

export default function ShowQr(): React.JSX.Element {
    const { horse_uuid } = useParams<{ horse_uuid: string }>();
    const qrValue = `${SITE_URL}/horse-details/${horse_uuid || ''}`;

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
                            <div className="marginbsixteen">
                                <QRCodeSVG
                                    value={qrValue}
                                    size={300}
                                    bgColor="#ffffff"
                                    fgColor="#000000"
                                    level="H"
                                />
                            </div>
                            <p className="text-normal">
                                <a href={qrValue}>{qrValue}</a>
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
