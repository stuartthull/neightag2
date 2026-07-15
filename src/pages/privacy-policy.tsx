import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy(): React.JSX.Element {
    return (
        <div className="page-wrapper">
            <div className="page-container">
                {/* 🛡️ HEADER HERO SECTION */}
                <section className="section-container white-section-container marginbsixteen">
                    <h1 className="textbig">Privacy Policy</h1>
                    <p className="text-normal">Last Updated: June 24, 2026</p>

                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        At NeighTag ("we," "our," or "us"), we are committed to protecting your
                        privacy. This Privacy Policy explains how we collect, use, disclose, and
                        safeguard your information when you visit and use{' '}
                        <strong>neightag.com</strong>, including our health tracking logs, calendar
                        features, and QR profile tools.
                    </p>

                    <hr
                        className="marginbsixteen"
                        style={{ border: '0', borderTop: '1px solid #e2e8f0' }}
                    />

                    {/* SECTION 1 */}
                    <h2 className="textmedium marginbeight">1. Information We Collect</h2>
                    <p className="text-normal marginbeight">
                        We collect information that you voluntarily provide to us when using our
                        application:
                    </p>
                    <ul
                        className="text-normal marginbsixteen"
                        style={{ paddingLeft: '20px', lineHeight: '1.6' }}
                    >
                        <li className="marginbeight">
                            <strong>Account Credentials:</strong> Email addresses and secure
                            authorisation IDs handled via our backend authentication platform
                            (Supabase).
                        </li>
                        <li className="marginbeight">
                            <strong>Equestrian Records:</strong> Details regarding your horses,
                            including medical timelines, farrier appointments, training schedules,
                            and photos you actively upload.
                        </li>
                        <li className="marginbeight">
                            <strong>Public QR Metadata:</strong> Any specific health or contact
                            records you explicitly configure to display publicly when someone scans
                            your physical horse tags.
                        </li>
                    </ul>

                    {/* SECTION 2 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>
                        2. How We Use Your Information
                    </h2>
                    <p className="text-normal marginbeight">
                        Your data is strictly utilized to keep your stable logs functioning
                        securely. We use it to:
                    </p>
                    <ul
                        className="text-normal marginbsixteen"
                        style={{ paddingLeft: '20px', lineHeight: '1.6' }}
                    >
                        <li className="marginbeight">
                            Authenticate your session and protect your records from unauthorised
                            viewers.
                        </li>
                        <li className="marginbeight">
                            Populate and order your calendar itineraries, upcoming clinic listings,
                            and reminders.
                        </li>
                        <li className="marginbeight">
                            Render emergency contact sheets when a customized NeighTag QR code is
                            scanned in the field.
                        </li>
                    </ul>

                    {/* SECTION 3 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>
                        3. Data Sharing & Infrastructure
                    </h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        <strong>
                            We do not sell, trade, or rent your personal information to third-party
                            advertisers.
                        </strong>{' '}
                        To deliver our services reliably, we share data exclusively with trusted
                        cloud providers bound by strict confidentiality requirements:
                    </p>
                    <ul
                        className="text-normal marginbsixteen"
                        style={{ paddingLeft: '20px', lineHeight: '1.6' }}
                    >
                        <li className="marginbeight">
                            <strong>Supabase:</strong> For secure database management, PostgreSQL
                            engine hosting, and modern user account protection framework.
                        </li>
                        <li className="marginbeight">
                            <strong>Stripe / Payment Processors:</strong> For subscription logic and
                            secure billing processing, if applicable. Your raw credit card details
                            never touch our local servers.
                        </li>
                    </ul>

                    {/* SECTION 4 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>
                        4. Data Security & Storage
                    </h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        We utilize secure Row-Level Security (RLS) tokens on our databases to
                        isolate your horse records, ensuring users can only read or edit data
                        explicitly assigned to their specific account identifier.
                    </p>

                    <div
                        className="section-container lightorange-section-container marginbsixteen"
                        style={{ borderLeft: '4px solid #f97316' }}
                    >
                        <p className="text-normal" style={{ margin: 0, fontSize: '14px' }}>
                            🔒 <strong>Public vs. Private Scope:</strong> Any parameters you insert
                            into standard private logs are completely locked behind your login
                            screen. Only information you manually toggled to show on the public QR
                            landing view can be reached by an outside scanner.
                        </p>
                    </div>

                    {/* SECTION 5 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>
                        5. Your Rights & Deletion Requests
                    </h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        You retain full ownership of your data. You may review, modify, or
                        permanently wipe out your horse accounts, calendar cards, or complete
                        profile matrices directly via your user dashboard adjustments at any time.
                    </p>

                    {/* SECTION 6 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>
                        6. Contact Our Team
                    </h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        If you have any questions, worries, or suggestions regarding this Privacy
                        Policy or your data isolation, don't hesitate to reach out to us at:
                    </p>
                    <p className="text-normal" style={{ fontWeight: '600', margin: 0 }}>
                        Email:{' '}
                        <span className="text-purple">
                            <a href="mailto:info@neightag.com">info@neightag.com</a>
                        </span>
                    </p>
                </section>
            </div>
        </div>
    );
}
