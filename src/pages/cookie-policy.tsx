import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function CookiePolicy(): React.JSX.Element {
    const navigate = useNavigate();

    return (
        <div className="page-wrapper">
            <div className="page-container">

                {/* 🛡️ HEADER HERO SECTION */}
                <section className="section-container purple-section-container marginbsixteen">
                    <button onClick={() => navigate(-1)} className="buttonWhite buttonMain" style={{ marginBottom: '20px' }}>
                        ← Go Back
                    </button>
                    <h1 className="textbig">Cookie Policy</h1>
                    <p className="text-normal">Last Updated: June 24, 2026</p>
                </section>

                {/* 📜 CONTENT AREA */}
                <section className="section-container white-section-container">
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        At NeighTag ("we," "our," or "us"), we believe in being completely transparent about how we collect and process data relating to you. This Cookie Policy explains what cookies are, how we use them on <strong>neightag.com</strong>, and the choices you have regarding their use.
                    </p>

                    <hr className="marginbsixteen" style={{ border: '0', borderTop: '1px solid #e2e8f0' }} />

                    {/* SECTION 1 */}
                    <h2 className="textmedium marginbeight">1. What Are Cookies?</h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        Cookies are small text files that are stored on your computer, tablet, or mobile device when you visit a website. They allow the website to recognize your device, remember your preferences, keep your login session secure, and generally improve your browsing experience.
                    </p>
                    <ul className="text-normal marginbsixteen" style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                        <li className="marginbeight"><strong>First-Party Cookies:</strong> Set directly by us (neightag.com).</li>
                        <li className="marginbeight"><strong>Third-Party Cookies:</strong> Set by external services we use (such as our database provider, Supabase, or payment infrastructure).</li>
                    </ul>

                    {/* SECTION 2 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>2. How We Use Cookies</h2>
                    <p className="text-normal marginbsixteen">
                        We use cookies to make our application work seamlessly, protect your account data, and understand how visitors interact with our platform. They fall into three primary categories:
                    </p>

                    {/* COOKIE TABLE */}
                    <div style={{ overflowX: 'auto', marginBottom: '24px' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                            <thead>
                            <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px', fontWeight: 'bold' }}>Cookie Type</th>
                                <th style={{ padding: '12px', fontWeight: 'bold' }}>What They Do</th>
                                <th style={{ padding: '12px', fontWeight: 'bold' }}>Mandatory?</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                <td style={{ padding: '12px', fontWeight: '600' }}>Essential / Strictly Necessary</td>
                                <td style={{ padding: '12px', color: '#475569' }}>These cookies are vital for running the site. They manage your secure authentication tokens via Supabase so you stay securely logged in while managing your stable logs, horses, and calendar parameters.</td>
                                <td style={{ padding: '12px', color: '#b91c1c', fontWeight: 'bold' }}>Yes</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                <td style={{ padding: '12px', fontWeight: '600' }}>Performance & Analytics</td>
                                <td style={{ padding: '12px', color: '#475569' }}>These help us understand how users interact with NeighTag (e.g., which buttons get clicked most or which sections face slow load times). This data lets us continuously debug and improve the user interface.</td>
                                <td style={{ padding: '12px', color: '#4b5563' }}>No</td>
                            </tr>
                            <tr style={{ borderBottom: '1px solid #edf2f7' }}>
                                <td style={{ padding: '12px', fontWeight: '600' }}>Functionality Preferences</td>
                                <td style={{ padding: '12px', color: '#475569' }}>These remember choices you make, such as keeping specific layout components or form memory settings persistent across pages.</td>
                                <td style={{ padding: '12px', color: '#4b5563' }}>No</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* SECTION 3 */}
                    <h2 className="textmedium marginbeight">3. Key Third-Party Technologies We Rely On</h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        Because NeighTag handles vital equestrian data and secure user profiles, we use industry-trusted infrastructure tools that utilize their own essential technical storage:
                    </p>
                    <ul className="text-normal marginbsixteen" style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
                        <li className="marginbeight"><strong>Supabase:</strong> We use Supabase to safely store your user authentication status, database logs, and privacy matrices. Supabase stores essential tokens in your browser's local storage or cookies to securely verify who you are on every page request.</li>
                        <li className="marginbeight"><strong>Payment Infrastructure:</strong> If you subscribe to our QR code features, our payment processors may utilize necessary security cookies to safely process transactions and prevent malicious fraud.</li>
                    </ul>

                    {/* SECTION 4 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>4. Controlling Your Cookie Choices</h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        You have the right to decide whether to accept or reject cookies. You can configure or amend your web browser controls to accept or refuse cookies by looking into your specific browser's settings dashboard menu.
                    </p>

                    <div className="section-container lightorange-section-container marginbsixteen" style={{ borderLeft: '4px solid #f97316' }}>
                        <p className="text-normal" style={{ margin: 0, fontSize: '14px' }}>
                            ⚠️ <strong>Please Note:</strong> If you choose to completely reject strictly necessary essential cookies, you will not be able to log in, maintain your account session, or update your horse's profile matrix, as our secure user database relies on these tokens to protect your privacy.
                        </p>
                    </div>

                    {/* SECTION 5 & 6 */}
                    <h2 className="textmedium marginbeight" style={{ marginTop: '24px' }}>5. Contact Us</h2>
                    <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                        If you have any questions, worries, or suggestions regarding our use of cookies, don't hesitate to reach out to us at:
                    </p>
                    <p className="text-normal" style={{ fontWeight: '600', margin: 0 }}>
                        Email: <span className="text-purple"><a href="mailto:info@neightag.com">info@neightag.com</a></span>
                    </p>
                </section>

            </div>
        </div>
    );
}