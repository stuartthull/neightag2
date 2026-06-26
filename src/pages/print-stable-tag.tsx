import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

export default function PrintStableTag(): React.JSX.Element {
    const [searchParams] = useSearchParams();
    const horseId = searchParams.get('id') || '';
    const horseName = searchParams.get('name') || 'Horse Records';

    const absoluteUrl = `https://www.neightag.com/horse-details/${horseId}`;

    return (
        <div style={{ backgroundColor: '#ffffff', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <style>{`
                @media screen {
                    body { background-color: #f1f5f9 !important; }
                    .stable-card-print-area { 
                        box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.15); 
                    }
                }
                @media print {
                    body, html { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
                    .stable-card-print-area { display: block !important; margin: 20mm auto !important; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
                }
                  .navigation.no-print, .main-footer {
                    display: none;
                }
                .stable-card-print-area {
                    width: 100%;
                    max-width: 400px;
                    border: 10px solid #000000;
                    padding: 24px 20px;
                    text-align: center;
                    box-sizing: border-box;
                    background: #ffffff;
                }
                .stable-print-header-tag, .stable-print-footer-tag {
                    font-size: 12px;
                    text-transform: uppercase;
                    letter-spacing: 2px;
                    color: #000000;
                    font-weight: bold;
                }
                .stable-print-header-tag { margin-bottom: 6px; }
                .stable-print-footer-tag { margin-top: 16px; }
                .stable-print-title {
                    font-size: 28px;
                    margin: 0 0 16px 0;
                    font-weight: 800;
                    color: #000000;
                }
                .stable-print-qr-wrapper {
                    display: inline-block;
                    padding: 14px;
                    background: #ffffff;
                    border: 1px solid #000000;
                    border-radius: 12px;
                    margin-bottom: 16px;
                }
                .stable-print-alert-footer {
                    background-color: #ff0000 !important;
                    border-radius: 8px;
                    padding: 6px;
                    font-size: 11px;
                    color: #ffff00;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border: 1px solid #000000;
                    margin: 0;
                }
            `}</style>

            <div className="stable-card-print-area">
                <div className="stable-print-header-tag">NeighTag Records</div>
                <h1 className="stable-print-title">{horseName}</h1>
                <div className="stable-print-qr-wrapper">
                    <QRCodeSVG value={absoluteUrl} size={140} bgColor={"#ffffff"} fgColor={"#000000"} level={"H"} />
                </div>
                <p className="stable-print-alert-footer">⚠️ Scan In Case of Emergency</p>
                <p className="stable-print-footer-tag">Powered by neightag.com</p>
            </div>
        </div>
    );
}