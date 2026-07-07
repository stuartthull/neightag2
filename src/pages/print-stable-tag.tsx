import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import withSubscriptionProtection from '../components/with-subscription-protection';

function PrintStableTag(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const horseId = searchParams.get('id') || '';

    const absoluteUrl = `https://www.neightag.com/horse-details/${horseId}`;
    const backgroundUrl = `${process.env.PUBLIC_URL}/images/print-bg.jpg`;

    return (
        <div className="print-stable-tag-page">
            <div
                className="stable-card-print-area"
                style={{ '--stable-print-bg-image': `url('${backgroundUrl}')` } as React.CSSProperties}
            >
                <div className="stable-print-header-tag"><img width="100" src={`${process.env.PUBLIC_URL}/images/logo-png.png`} alt="NeighTag Logo" /></div>
                <p className="stable-print-alert-footer">⚠️ Scan In Case of Emergency</p>
                <div className="stable-print-qr-wrapper">
                    <QRCodeSVG value={absoluteUrl} size={120} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
                </div>

                <p className="stable-print-footer-tag">Powered by www.neightag.com</p>
            </div>
        </div>
    );
}
export default withSubscriptionProtection(PrintStableTag, { requireAuthentication: true });