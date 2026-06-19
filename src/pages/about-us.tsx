import React from 'react';
import Janeone from "../assets/jane1.jpg";

export default function AboutUs(): React.JSX.Element {
    return (
        <main className="page-wrapper">
            <div className="page-container">

                {/* HERO SECTION */}
                <section className="section-container purple-section-container">
                    <h1 className="textbig">About Us</h1>
                    <h2 className="textmedium" style={{ color: '#f1f5f9', marginTop: '8px' }}>
                        Welcome to NeighTag! 🐴
                    </h2>
                    <p className="text-normal" style={{ marginTop: '16px', lineHeight: '1.6' }}>
                        We are a small, horse-loving family who live and breathe the equestrian world.
                        If we aren't at the yard, you will usually find us loaded up in the horsebox,
                        heading out to our next competition.
                    </p>
                </section>

                {/* THE INSPIRATION (JANE) */}
                <section className="section-container white-section-container marginbsixteen">

                    {/* 📦 1. Flex container for the split row layout */}
                    <div className="about-split-row">

                        {/* Left Side: Text Column */}
                        <div className="about-text-col">
                            <h3 className="textmedium marginbeight">Meet Jane, Our Inspiration</h3>
                            <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                                Our absolute pride and joy is <strong>Jane</strong>, our Irish Sports Horse.
                                She is the true inspiration behind everything we do here.
                            </p>
                            <p className="text-normal" style={{ lineHeight: '1.6' }}>
                                Jane loves nothing more than leaving a massive gallop track across an open field,
                                tackling bold cross-country lines, and jumping her heart out. She keeps us on our toes,
                                teaches us something new every day, and reminds us why we fell in love with horses in the first place.
                            </p>
                            {/* Remaining section items continue full-width below */}
                            <h3 className="textmedium marginbeight margintsixteen">Why We Started NeighTag</h3>
                            <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                                As active competitors and horse owners, we know firsthand that the horse world can be as overwhelming as it is rewarding.
                                Between managing farrier schedules, tracking vet histories, keeping up with horsebox maintenance, and making sure
                                vital safety information is accessible in an emergency—there is a massive amount of paperwork to juggle.
                            </p>
                            <p className="text-normal marginbsixteen" style={{ lineHeight: '1.6' }}>
                                We also noticed how incredibly expensive everything in the equestrian world has to be. We wanted to change that.
                            </p>
                        </div>

                        {/* Right Side: Image Column */}
                        <img src={Janeone} alt="Jane our horse" className="jane-image" />
                    </div>



                    {/* PRICING CALLOUT PANEL */}
                    <div className="horsebox-panel breakdown-panel" style={{ backgroundColor: '#fef3c7', borderColor: '#fde68a', padding: '20px', borderRadius: '8px' }}>
                        <p className="text-normal" style={{ color: '#78350f', margin: 0, lineHeight: '1.6' }}>
                            💡 We built <strong>NeighTag</strong> to provide a simple, stress-free, and highly affordable way for riders to
                            organize their stables and protect their horses. We kept our digital profile and calendar tools
                            <strong className="text-purple"> 100% free</strong>, and made our emergency QR code system
                            <strong className="text-purple"> just £1 a month</strong>. We wanted to prove that keeping your horse safe
                            doesn't have to break the bank.
                        </p>
                    </div>
                </section>

                <section className="section-container purple-section-container">
                    <h3 className="textmedium marginbsixteen" style={{ color: '#ffffff' }}>Our Promise to You</h3>
                    <p className="text-normal marginbsixteen">
                        Because we are horse owners ourselves, we treat your data and your horses exactly how we treat our own.
                    </p>

                    <div >
                        <div className="marginbsixteen">
                            <h4 className="textmedium">🤝 Community First</h4>
                            <p className="text-normal">
                                We aren't a massive, faceless corporation. We are a real family building tools that we actually use at the yard every single day.
                            </p>
                        </div>
                        <div className="marginbsixteen">
                            <h4 className="textmedium">🛡️ Safety & Care</h4>
                            <p className="text-normal">
                                We ensure that if an emergency ever happens, anyone can scan your horse's unique QR tag to see vital medical records and emergency contacts instantly.
                            </p>
                        </div>
                        <div className="marginbsixteen">
                            <h4 className="textmedium">✨ No Hidden Catch</h4>
                            <p className="text-normal">
                                We promise to keep our platform straightforward and transparent. Even if you pause your subscription, we will always store your horse's details safely.
                            </p>
                        </div>
                    </div>
                </section>

                {/* SIGN OFF */}
                <footer style={{ textAlign: 'center', paddingTop: '24px', paddingBottom: '24px' }}>
                    <p className="text-normal">
                        Thank you for being part of the NeighTag family. We’ll see you out on the cross-country course!
                    </p>
                    <p className="text-purple" style={{ fontWeight: 'bold', marginTop: '8px', fontSize: '1.2rem' }}>
                        — The NeighTag Family (Mandy, Abs and Jane! 🥕)
                    </p>
                </footer>

            </div>
        </main>
    );
}