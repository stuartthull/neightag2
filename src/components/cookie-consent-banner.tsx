import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

type ConsentChoice = 'accepted' | 'rejected';

const COOKIE_CONSENT_KEY = 'neightag_cookie_consent';
const CONSENT_DURATION_DAYS = 395;
const CONSENT_DURATION_MS = CONSENT_DURATION_DAYS * 24 * 60 * 60 * 1000;

interface StoredConsent {
    choice: ConsentChoice;
    expiresAt: number;
}

function isConsentChoice(value: string | null): value is ConsentChoice {
    return value === 'accepted' || value === 'rejected';
}

function getCookieValue(name: string): string | null {
    const cookie = document.cookie
        .split('; ')
        .find((entry) => entry.startsWith(`${name}=`));

    return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : null;
}

function writeConsentCookie(consent: StoredConsent) {
    const maxAgeSeconds = Math.floor(CONSENT_DURATION_MS / 1000);
    const secureAttribute = window.location.protocol === 'https:' ? '; Secure' : '';

    document.cookie = `${COOKIE_CONSENT_KEY}=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secureAttribute}`;
}

function readStoredConsent(): ConsentChoice | null {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY) || getCookieValue(COOKIE_CONSENT_KEY);

    if (isConsentChoice(saved)) {
        return saved;
    }

    if (!saved) {
        return null;
    }

    try {
        const parsed = JSON.parse(saved) as Partial<StoredConsent>;

        if (isConsentChoice(parsed.choice || null) && typeof parsed.expiresAt === 'number') {
            if (parsed.expiresAt > Date.now()) {
                return parsed.choice;
            }

            localStorage.removeItem(COOKIE_CONSENT_KEY);
            document.cookie = `${COOKIE_CONSENT_KEY}=; Max-Age=0; Path=/; SameSite=Lax`;
        }
    } catch {
        localStorage.removeItem(COOKIE_CONSENT_KEY);
    }

    return null;
}

function persistConsent(choice: ConsentChoice) {
    const consent = {
        choice,
        expiresAt: Date.now() + CONSENT_DURATION_MS
    };

    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(consent));
    writeConsentCookie(consent);

    // Emit a global event so analytics integrations can listen and react.
    window.dispatchEvent(
        new CustomEvent('neightag-cookie-consent', {
            detail: { choice }
        })
    );
}

export default function CookieConsentBanner(): React.JSX.Element | null {
    const [consentChoice, setConsentChoice] = useState<ConsentChoice | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const saved = readStoredConsent();
        if (saved) {
            setConsentChoice(saved);
        }
        setIsReady(true);
    }, []);

    if (!isReady || consentChoice) {
        return null;
    }

    const handleConsent = (choice: ConsentChoice) => {
        persistConsent(choice);
        setConsentChoice(choice);
    };

    return (
        <section
            role="dialog"
            aria-live="polite"
            aria-label="Cookie consent"
            style={{
                position: 'fixed',
                bottom: '16px',
                left: '16px',
                right: '16px',
                zIndex: 1000,
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.18)',
                padding: '16px',
                maxWidth: '900px',
                margin: '0 auto'
            }}
        >
            <p style={{ margin: '0 0 10px 0', fontSize: '14px', lineHeight: 1.5, color: '#0f172a' }}>
                We use essential cookies to keep the site secure and working. You can accept or reject non-essential cookies.
                Read our{' '}
                <Link to="/cookie-policy">Cookie Policy</Link>.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    type="button"
                    className="buttonMain buttonPurple"
                    style={{ padding: '10px 18px' }}
                    onClick={() => handleConsent('accepted')}
                >
                    Accept
                </button>
                <button
                    type="button"
                    className="buttonMain"
                    style={{ padding: '10px 18px', background: '#e2e8f0', color: '#0f172a' }}
                    onClick={() => handleConsent('rejected')}
                >
                    Reject
                </button>
            </div>
        </section>
    );
}
