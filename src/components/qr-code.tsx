import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface HorseQrCodeProps {
    horseId: number | string;
    horseName: string;
}

export default function HorseQrCode({ horseId, horseName }: HorseQrCodeProps): React.JSX.Element {
    const absoluteUrl = `https://neightag2.netlify.app/horse/${horseId}`;

    const handlePrint = (): void => {
        // Works seamlessly across all desktop and mobile browsers
        window.print();
    };

    return (
        <>
            {/* 1. Global Print Stylesheets Injection */}
            <style>{`
                /* 🖥️ Hide the print layout on the screen standard view */
                .stable-card-print-area {
                    display: none;
                }

                /* 🖨️ Triggered exclusively when printing */
                @media print {
                    /* Hide EVERYTHING on the dashboard web page layout */
                    body *, html * {
                        visibility: hidden;
                        height: 0;
                        margin: 0;
                        padding: 0;
                    }
                    
                    /* Show ONLY our specialized stable badge card */
                    .stable-card-print-area, .stable-card-print-area * {
                        visibility: visible;
                        height: auto;
                    }

                    /* Center it nicely on the paper sheet */
                    .stable-card-print-area {
                        display: block !important;
                        position: absolute;
                        left: 50%;
                        top: 40%;
                        transform: translate(-50%, -50%);
                        width: 90%;
                        max-width: 380px;
                        border: 4px solid #994899;
                        border-radius: 16px;
                        padding: 30px 24px;
                        text-align: center;
                        box-sizing: border-box;
                        background: #ffffff;
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
                        -webkit-print-color-adjust: exact; /* Ensures color renders on mobile printers */
                        print-color-adjust: exact;
                    }

                    .stable-print-logo {
                        max-width: 100px;
                        margin: 0 auto 16px;
                        display: block;
                    }
                }
            `}</style>

            {/* 2. Standard Screen View Card (What users see inside the dashboard) */}
            <div style={styles.qrContainer}>
                <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Stable QR Code Tag</h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 15px 0', lineHeight: '1.4' }}>
                    Generate a door tag for {horseName}'s stable box.
                </p>

                {/* ✅ FIXED: Changed display from 'none' to 'inline-block' so the component renders beautifully */}
                <div style={{ display: 'inline-block', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
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
                        style={{ padding: '10px 20px', fontSize: '0.9rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                    >
                        <span>🖨️</span> Print Stable Card
                    </button>
                </div>
            </div>

            {/* 3. Hidden Print Blueprint Layout (Invisible on screen, only parsed by printer) */}
            <div className="stable-card-print-area">
                <img src="/images/logo.jpg" className="stable-print-logo" alt="" />
                <div className="stable-print-header-tag">NeighTag Vital Records</div>
                <h1 className="stable-print-title">{horseName}</h1>
                <p className="stable-print-subtitle">Scan this QR code with any smartphone camera to instantly view emergency contacts, medical logs, and dietary history.</p>

                <div className="stable-print-qr-wrapper">
                    <QRCodeSVG
                        value={absoluteUrl}
                        size={220} // Slightly bigger size for optimal paper scans
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

const styles: Record<string, React.CSSProperties> = {
    qrContainer: {
        backgroundColor: '#f8fafc',
        border: '1px solid #e2e8f0',
        padding: '24px',
        borderRadius: '12px',
        textAlign: 'center',
        width: '100%',
        margin: '20px 0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    }
};