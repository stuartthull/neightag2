import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface HorseQrCodeProps {
    horseId: number | string;
    horseName: string;
}

export default function HorseQrCode({ horseId, horseName }: HorseQrCodeProps): React.JSX.Element {
    const absoluteUrl = `https://www.neightag.com/horse-details/${horseId}`;

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
                        max-width: 340px !important;
                        border: 10px solid #000000 !important;
                        padding: 12px 60px !important;
                        text-align: center !important;
                        box-sizing: border-box !important;
                        background: #ffffff url('/images/aluminium.jpg') center / cover no-repeat !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        page-break-inside: avoid;
                    }

                    .stable-print-header-tag {
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 2px;
                        color: #000000;
                        font-weight: bold;
                        margin-bottom: 6px;
                    }
                    
                    .stable-print-footer-tag {
                        font-size: 12px;
                        letter-spacing: 2px;
                        color: #000000;
                        font-weight: bold;
                        margin-bottom: 6px;
                    }

                    .stable-print-title {
                        font-size: 24px;
                        margin: 0 0 8px 0;
                        font-weight: 800;
                        color: #000000;
                    }

                    .stable-print-subtitle {
                        font-size: 12px;
                        margin: 0 0 8px 0;
                        line-height: 1.4;
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
                        padding: 4px;
                        font-size: 10px;
                        color: #ffff00;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                        border: 1px solid #000000;
                        margin-bottom: 16px;
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

                    <div style={{ visibility: 'hidden', height: '0', overflow: 'hidden' }}>
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
                            className="buttonMain buttonPurple"
                        >
                            <span>🖨️</span> Print Stable Card
                        </button>
                    </div>
                </div>
            </div>

            {/* 3. Hidden Print Blueprint Layout (Fixed position layer to bypass nested parent hides) */}
            <div className="stable-card-print-area">
                <div className="stable-print-header-tag">NeighTag Records</div>
                <h1 className="stable-print-title">{horseName}</h1>
                {/*<p className="stable-print-subtitle">Scan this QR code with any smartphone camera to instantly view emergency contacts, medical logs, and dietary history.</p>*/}

                <div className="stable-print-qr-wrapper">
                    <QRCodeSVG
                        value={absoluteUrl}
                        size={120}
                        bgColor={"#ffffff"}
                        fgColor={"#000000"}
                        level={"H"}
                    />
                </div>
                <p className="stable-print-alert-footer">
                    ⚠️ Scan In Case of Emergency
                </p>
                <p className="stable-print-footer-tag">www.neightag.com</p>

            </div>
        </>
    );
}
