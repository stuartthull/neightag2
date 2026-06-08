import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface HorseQrCodeProps {
    horseId: number | string;
    horseName: string;
}

export default function HorseQrCode({ horseId, horseName }: HorseQrCodeProps): React.JSX.Element {
    const absoluteUrl = `${window.location.origin}/horse/${horseId}`;
    const qrRef = useRef<HTMLDivElement>(null);

    const handlePrint = (): void => {
        const qrSvgHtml = qrRef.current?.innerHTML;
        if (!qrSvgHtml) return;

        // Create a hidden print iframe to prevent document.body reloads entirely
        const iframe = document.createElement('iframe');
        iframe.style.position = 'absolute';
        iframe.style.width = '0px';
        iframe.style.height = '0px';
        iframe.style.border = 'none';
        document.body.appendChild(iframe);

        const iframeDoc = iframe.contentWindow?.document;
        if (!iframeDoc) return;

        // Construct a clean, isolated HTML canvas template inside the print document
        iframeDoc.open();
        iframeDoc.write(`
            <html>
                <head>
                    <title>Print Stable Tag - ${horseName}</title>
                    <style>
                        @page {
                            size: A5 portrait;
                            margin: 0;
                        }
                        body {
                            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
                            margin: 0;
                            padding: 20px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 90vh;
                            background-color: #ffffff;
                        }
                        /* The Stable Badge Container Card */
                        .stable-card {
                            width: 100%;
                            max-width: 380px;
                            border: 4px double #581c87;
                            border-radius: 16px;
                            padding: 30px 24px;
                            text-align: center;
                            box-sizing: border-box;
                            background: #ffffff;
                        }
                        .header-tag {
                            font-size: 10px;
                            text-transform: uppercase;
                            letter-spacing: 2px;
                            color: #7e22ce;
                            font-weight: bold;
                            margin-bottom: 6px;
                        }
                        h1 {
                            font-size: 28px;
                            color: #1e293b;
                            margin: 0 0 8px 0;
                            font-weight: 800;
                            border-bottom: 2px solid #f3e8ff;
                            padding-bottom: 12px;
                        }
                        .subtitle {
                            font-size: 13px;
                            color: #475569;
                            margin: 0 0 25px 0;
                            line-height: 1.4;
                        }
                        .qr-wrapper {
                            display: inline-block;
                            padding: 14px;
                            background: #ffffff;
                            border: 1px solid #e2e8f0;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
                            margin-bottom: 25px;
                        }
                        /* Highlighted Footer instructions for handlers or vets */
                        .alert-footer {
                            background-color: #fdf2f8;
                            border: 1px dashed #f472b6;
                            border-radius: 8px;
                            padding: 10px;
                            font-size: 11px;
                            color: #be185d;
                            font-weight: 600;
                            text-transform: uppercase;
                            letter-spacing: 0.5px;
                        }
                            .logo {
                            max-width: 100px;
                            margin: 0 auto 16px;
                            }
                    </style>
                </head>
                <body>
                    <div class="stable-card">
                        <span>
                            <img src="/images/logo.jpg"  class="logo" alt="" />
                        </span>
                        <div class="header-tag">EquiLog Vital Records</div>
                        <h1>${horseName}</h1>
                        <p class="subtitle">Scan this QR code with any smartphone camera to instantly view emergency contacts, medical logs, and dietary history.</p>
                        
                        <div class="qr-wrapper">
                            ${qrSvgHtml}
                        </div>
                        
                        <div class="alert-footer">
                            ⚠️ In Case of Emergency Scan Badge
                        </div>
                    </div>
                </body>
            </html>
        `);
        iframeDoc.close();

        // Trigger printer focus window context
        setTimeout(() => {
            iframe.contentWindow?.focus();
            iframe.contentWindow?.print();
            // Cleanup and delete the temporary print node frame out of the DOM
            document.body.removeChild(iframe);
        }, 500);
    };

    return (
        <div style={styles.qrContainer}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b' }}>Stable QR Code Tag</h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 15px 0', lineHeight: '1.4' }}>
                Generate a weatherproof door tag for {horseName}'s stable box.
            </p>

            {/* Hidden source hook used strictly to copy pure SVG structure nodes */}
            <div ref={qrRef} style={{ display: 'inline-block', padding: '10px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
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