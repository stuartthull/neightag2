import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

import homeHorse from '../assets/home-horse.jpg';
import EnterDetails from '../assets/enter-details.png';
import Money from '../assets/money.jpg';
import QrCode from '../assets/qr-code.png';
import ScanCode from '../assets/scan-code.png';
import Calendar from '../assets/calendar.jpg';

interface QuickEvent {
    id: number;
    calendar_title: string;
    calendar_date: string;
}

function Home(): React.JSX.Element {
    const [session, setSession] = useState<Session | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<QuickEvent[]>([]);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        if (!session?.user?.id) {
            setUpcomingEvents([]);
            return;
        }

        const fetchUpcomingAlerts = async () => {
            const todayStr = new Date().toISOString().split('T')[0];
            const upperLimitObj = new Date();
            upperLimitObj.setDate(upperLimitObj.getDate() + 7);
            const upperLimitStr = upperLimitObj.toISOString().split('T')[0];

            const { data, error } = await supabase
                .from('equi_calendar')
                .select('id, calendar_title, calendar_date')
                .eq('user_uuid', session.user.id)
                .gte('calendar_date', todayStr)
                .lte('calendar_date', upperLimitStr)
                .order('calendar_date', { ascending: true })
                .order('calendar_time', { ascending: true });

            if (!error && data) {
                setUpcomingEvents(data as QuickEvent[]);
            }
        };

        fetchUpcomingAlerts();
    }, [session]);

    return (
        <main className="page-wrapper">
            <div className="home-hero">
                <img src={homeHorse} alt="Equestrian Home" className="hero-bg-img" />
                <div className="centered-button">
                    {session ? (
                        <Link to="/dashboard" className="buttonPurple buttonMain">Go to Dashboard</Link>
                    ) : (
                        <Link to="/login?mode=signup" className="buttonPurple buttonMain">Sign up now!</Link>
                    )}
                </div>
            </div>

            <div className="page-container home-layout-grid">
                {/* UPCOMING EVENTS */}
                {session && upcomingEvents.length > 0 && (
                    <div className="section-container lightorange-section-container full-width">
                        <h2 className="textbig">Your upcoming events</h2>
                        <div>
                            <p className="marginbsixteen">
                                <span>📅</span>{' '}-{' '}
                                <strong className="text-normal">Next 7 Days:</strong>
                            </p>
                            <ul className="events-list">
                                {upcomingEvents.map(event => (
                                    <li key={event.id} className="marginbsixteen">
                                        <Link to={`/calendar/edit/${event.id}`} className="text-normal">
                                            {event.calendar_title}{' '}-{' '}
                                            <span>
                                                ({new Date(event.calendar_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {/* HOW IT WORKS */}
                <div className="section-container purple-section-container full-width">
                    <h1 className="textbig">How it works.</h1>
                    <div className="info-bar-grid">
                        <div className="info-bar">
                            <div className="info-bar-fixed"><img src={EnterDetails} alt="Enter details" /></div>
                            <div className="info-bar-column">
                                <h2 className="textmedium">Upload your details</h2>
                                <p className="text-normal">Fill in the information about your horse. Choose what you wish to show and what to keep hidden in your account area.</p>
                            </div>
                        </div>

                        <div className="info-bar">
                            <div className="info-bar-fixed"><img src={QrCode} alt="Get QR Code" /></div>
                            <div className="info-bar-column">
                                <h2 className="textmedium">Get your QR code</h2>
                                <p className="text-normal">Either purchase a waterproof plastic tag for your stable. Or simple print it out and stick it on your stable.</p>
                            </div>
                        </div>

                        <div className="info-bar">
                            <div className="info-bar-fixed"><img src={ScanCode} alt="Access info" /></div>
                            <div className="info-bar-column">
                                <h2 className="textmedium">Access vital info instantly</h2>
                                <p className="text-normal">Emergency contacts, medical details, and stable information are instantly accessible for both rider and horse.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* PRICING & CALENDAR SPLIT ROW ON DESKTOP */}
                <div className="section-container white-section-container split-card">
                    <h2 className="textbig">How much does it cost.</h2>
                    <div className="pricing-content-wrapper">
                        <img className='marginbsixteen pricing-img' src={Money} alt='Pricing' />
                        <div className="pricing-text">
                            <p className='marginbsixteen'>Opening an account and adding details is free. You can store all the information you need for your horse and we wont need a penny.</p>
                            <p className='marginbsixteen'>If you wish to share your horse details via the QR code. We charge a <strong>bi-monthly fee of £1</strong>. Yes that's <strong>50p a month</strong>. </p>
                            <p className='marginbsixteen'>See, not all horse related things are expensive.</p>
                            <p className='marginbsixteen'>You can cancel your QR code view anytime, and we will retain your horse information for you.</p>
                            <p className='marginbsixteen'><strong>Whats not to like?</strong></p>
                        </div>
                    </div>
                </div>

                <div className="section-container white-section-container split-card">
                    <h2 className="textbig">Your EquiLog calendar.</h2>
                    <div className="pricing-content-wrapper">
                        <img className='marginbsixteen pricing-img' src={Calendar} alt="Calendar setup" />
                        <div className="pricing-text">
                            <p className="text-normal marginbsixteen">When you sign up for our paid service, you can add your schedule to your EquiLog calendar. Clinics on Thursday, farrier next week, dentist in 4 weeks. Whatever you have, you can add it to our EquiLog calendar.</p>
                            <p className="text-normal marginbsixteen">Get a message reminder a few days before so you dont forget those important dates.</p>
                            {!session && (
                                <Link to="/login?mode=signup" className="buttonWhite buttonMain">Sign up now!</Link>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main >
    );
}

export default Home;