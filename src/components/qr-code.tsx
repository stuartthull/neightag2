import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface HorseQrCodeProps {
    horseId: number | string;
    horseName: string;
}

export default function HorseQrCode({ horseId, horseName }: HorseQrCodeProps): React.JSX.Element {
    const absoluteUrl = `https://neightag2.netlify.app/horse-details/${horseId}`;

    const handlePrint = (): void => {
        window.print();
    };

    return (
        <>
            {/* 1. Global Print CSS Targets */}
            <style>{`
                /* 🖥️ Default screen state for print blueprint layout */
                .stable-card-print-area {
                    display: none;
                }

                /* 🖨️ Targeted Print Rules */
                @media print {
                    /* ✅ Hide the interactive screen card and global components cleanly */
                    .no-print, 
                    nav, 
                    header, 
                    footer, 
                    button,
                    aside,
                    #sidebar,
                    .navbar {
                        display: none !important;
                    }

                    /* Unbind paper margins */
                    @page {
                        size: auto;
                        margin: 15mm;
                    }

                    body, html {
                        background: #ffffff !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    /* ✅ Force display blueprint card as standard block container flow */
                    .stable-card-print-area {
                        display: block !important;
                        visibility: visible !important;
                        margin: 40px auto 0 auto !important;
                        width: 100% !important;
                        max-width: 380px !important;
                        border: 4px solid #115E59 !important;
                        border-radius: 16px !important;
                        padding: 30px 24px !important;
                        text-align: center !important;
                        box-sizing: border-box !important;
                        background: #ffffff !important;
                        page-break-inside: avoid;
                    }

                    .stable-print-header-tag {
                        font-size: 10px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #994899;
                        font-weight: bold;
                        margin-bottom: 6px;
                    }

                    .stable-print-title {
                        font-size: 28px;
                        color: #1e293b;
                        margin: 0 0 8px 0;
                        font-weight: 800;
                        border-bottom: 2px solid #f3e8ff;
                        padding-bottom: 12px;
                    }

                    .stable-print-subtitle {
                        font-size: 13px;
                        color: #475569;
                        margin: 0 0 25px 0;
                        line-height: 1.4;
                    }

                    .stable-print-qr-wrapper {
                        display: inline-block;
                        padding: 14px;
                        background: #ffffff;
                        border: 1px solid #e2e8f0;
                        border-radius: 12px;
                        margin-bottom: 25px;
                    }

                    .stable-print-alert-footer {
                        background-color: #fdf2f8 !important;
                        border: 1px dashed #f472b6;
                        border-radius: 8px;
                        padding: 10px;
                        font-size: 11px;
                        color: #be185d;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    .stable-print-logo {
                        max-width: 100px;
                        margin: 0 auto 16px;
                        display: block;
                    }
                }
            `}</style>

            {/* 2. Dashboard Screen View Container Box (Disappears when printing) */}
            <div className="no-print qr-container">
                <div>
                    <h3 className={"large-text"}>Stable QR Code Tag</h3>
                    <p className="text-normal">
                        Generate a door tag for {horseName}'s stable box.
                    </p>

                    <div style={{ textAlign: 'center', margin: '16px auto', width: 'fit-content' }}>
                        <QRCodeSVG
                            value={absoluteUrl}
                            size={160}
                            bgColor={"#ffffff"}
                            fgColor={"#000000"}
                            level={"H"}
                        />
                    </div>

                    <div style={{ marginTop: '18px' }}>
                        <button
                            onClick={handlePrint}
                            className="buttonMain buttonOrange"
                        >
                            <span>🖨️</span> Print Stable Card
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Hidden Print Blueprint Layout (Fixed position layer to bypass nested parent hides) */}
            <div className="stable-card-print-area">
                <div className="stable-print-header-tag">NeighTag Vital Records</div>
                <h1 className="stable-print-title">{horseName}</h1>
                {/*<p className="stable-print-subtitle">Scan this QR code with any smartphone camera to instantly view emergency contacts, medical logs, and dietary history.</p>*/}

                <div className="stable-print-qr-wrapper">
                    <QRCodeSVG
                        value={absoluteUrl}
                        size={150}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                    />
                </div>

                <div className="stable-print-alert-footer">
                    ⚠️ In Case of Emergency Scan Badge
                </div>
            </div>
        </>
    );
}
