import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import '../css/form-elements.css';
import '../css/home.css';
import withSubscriptionProtection from '../components/with-subscription-protection';

function HorseboxPoster({ qrValue }: { qrValue: string }): React.JSX.Element {
    return (
        <div className="print-horsebox-poster-page">
            <div className="dashboard-badge-print-area">
                <img width="100%" src={`${process.env.PUBLIC_URL}/images/horsebox-header.jpg`} alt="NeighTag Logo" />
                <div className="dashboard-badge-qr-wrapper">
                    <QRCodeSVG value={qrValue} size={300} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
                </div>
                <p>{!qrValue.includes('horse-details') && 'This is a dummy example of what you would get.'}</p>
                <img width="100%" src={`${process.env.PUBLIC_URL}/images/horsebox-footer.jpg`} alt="NeighTag Logo" />
            </div>
        </div>
    );
}

function PrintHorseboxPoster(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const horseId = searchParams.get('id') || '';

    return <HorseboxPoster qrValue={`https://www.neightag.com/horse-details/${horseId}`} />;
}

export function DummyPrintHorseboxPoster(): React.JSX.Element {
    return <HorseboxPoster qrValue="https://www.neightag.com" />;
}

export default withSubscriptionProtection(PrintHorseboxPoster, { requireAuthentication: true });
