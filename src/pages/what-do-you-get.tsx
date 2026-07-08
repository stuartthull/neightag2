import React from 'react';
import { Helmet } from 'react-helmet-async';
import BoxPoster from "../assets/horsebox-poster.jpg";
import StableSpoter from "../assets/stable-poster.jpg";
import PhoneApp from "../assets/phone-app.jpg";
import TapTag from "../assets/taptag.jpg";
import { LocalPrice } from '../components/local-price';

export default function WhatDoYouGet(): React.JSX.Element {
    return (
        <main className="page-wrapper">
            <Helmet>
                <title>About Us | Contact NeighTag</title>
                <meta name="description" content="Contact the horse-loving family behind NeighTag." />
                <meta property="og:title" content="About Us | Contact NeighTag" />
            </Helmet>
            <div className="page-container">

                {/* HERO SECTION */}
                <section className="section-container white-section-container">
                    <h1 className="textbig marginbsixteen">What Do You Get with NeighTag?</h1>

                    <p className="text-normal marginbsixteen">For less than <LocalPrice basePriceGbp={1} /> a month, when you join NeighTag, you aren't just getting QR codes—you're getting a complete, real-time safety ecosystem for your horse. Every account includes access to your digital stable dashboard and a suite of high-visibility, scannable assets designed for the yard and the road.</p>

                    <p className="textmedium marginbsixteen">The NeighTag Safety Suite Includes:</p>
                    <div className="neightag-feature-container">

                        <img src={StableSpoter} alt="Stable QR code" className="jane-image" />

                        <div className="neightag-feature-text">
                            <h2 className="textmedium">🏢 1. The Printable Stable Door Tag</h2>
                            <p className="text-normal marginbsixteen">Perfect for the yard, this high-contrast door card gives yard managers, grooms, and visiting vets immediate access to day-to-day care routines without cluttering your stable door with messy whiteboards.</p>

                            <ul>
                                <li className="text-normal marginbeight"><strong>Instant Routines:</strong> Scans reveal exact feeding instructions, turnout rules, and medication logs.</li>

                                <li className="text-normal marginbeight"><strong>Professional Layout:</strong> Designed to fit perfectly on standard stable doors or clipboards.</li>

                                <li className="text-normal marginbeight"><strong>Live Updates:</strong> Changed your feed or supplements this morning? Update it on your phone, and the stable tag updates instantly.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="neightag-feature-container">
                        {/* 📸 Image is placed first/on top for clean mobile stacking */}
                        <img src={BoxPoster} alt="Horse box emergency poster" className="jane-image" />

                        {/* 📝 Text content grouped together safely */}
                        <div className="neightag-feature-text">
                            <h2 className="textmedium">🚛 2. The Horsebox Emergency Poster</h2>
                            <p className="text-normal marginbsixteen">Designed for the showground, this essential safety sign looks out for your horse when you have to step away—whether you're walking a course, collecting numbers, or grabbing a quick coffee.</p>

                            <ul>
                                <li className="text-normal marginbeight"><strong>Crisis Management:</strong> If your horse becomes distressed in the box, bystanders just scan the code.</li>
                                <li className="text-normal marginbeight"><strong>Tap-to-Call Functionality:</strong> Instantly displays your emergency contact names and phone numbers with direct, clickable links for a rapid response.</li>
                                <li className="text-normal marginbeight"><strong>Peace of Mind:</strong> Gives you the freedom to navigate a busy event knowing help is always one tap away.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="neightag-feature-container">
                        <img src={TapTag} alt="Public matrix" className="jane-image" />

                        <div className="neightag-feature-text">
                            <h2 className="textmedium">📱 3. Introducing &copy;TapTag</h2>
                            <p className="text-normal marginbsixteen">We now can offer &copy;TapTag's.</p>

                            <ul>
                                <li className="text-normal marginbeight"><strong>Tap and view:</strong> No need to open your phone to scan the QR.</li>

                                <li className="text-normal marginbeight"><strong>Feel safe when out and about:</strong> Put it on your saddle, reigns or on your person.</li>
                                <li className="text-normal marginbeight"><strong>Get instant access:</strong> Get instant access to your emergency and contact details.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="neightag-feature-container">
                        <img src={PhoneApp} alt="Public matrix" className="jane-image" />

                        <div className="neightag-feature-text">
                            <h2 className="textmedium">📱 4. Your Live Digital Care Matrix</h2>
                            <p className="text-normal marginbsixteen">Behind every QR code is a secure, mobile-optimised profile page unique to each horse in your stable.</p>

                            <ul>
                                <li className="text-normal marginbeight"><strong>Comprehensive Medical Logs:</strong> Store passport details, allergies, and current medications securely.</li>

                                <li className="text-normal marginbeight"><strong>Dynamic Calendar Sync:</strong> Tracks upcoming visits for your farrier, vet, dentist, physio, and saddle fitter, displaying them transparently to anyone caring for your horse.</li>

                                <li className="text-normal marginbsixteen"><strong>Smart Privacy Matrix:</strong> You choose exactly what the public sees. Toggle your horse’s profile between completely public or hidden with a single flick of a switch.</li>
                            </ul>
                        </div>
                    </div>


                    <h2 className="textmedium">One Dashboard. Unlimited Control.</h2>
                    <p className="text-normal marginbsixteen">No reprints required. If your emergency contact changes mid-journey or your vet prescribes a new medication, simply log into your NeighTag account from your phone. Update the details in seconds, and your printable stable tags and horsebox posters are instantly updated in real time.</p>

                    <p className="text-normal marginbsixteen"><strong>Always linked. Always protected.</strong></p>

                    <p className="text-normal" style={{ marginTop: '16px', lineHeight: '1.6' }}>
                        If you wish to get in touch, email us on <a href="mailto:info@neightag.com">info@neightag.com</a>.
                    </p>
                </section>
            </div>
        </main>
    );
}