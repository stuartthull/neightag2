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

interface HorseBoxAlert {
    type: 'MOT' | 'Insurance' | 'Service';
    date: string;
}

function Home(): React.JSX.Element {
    const [session, setSession] = useState<Session | null>(null);
    const [upcomingEvents, setUpcomingEvents] = useState<QuickEvent[]>([]);
    const [horseBoxAlerts, setHorseBoxAlerts] = useState<HorseBoxAlert[]>([]);

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
            setHorseBoxAlerts([]);
            return;
        }

        const fetchUpcomingAlerts = async () => {
            const todayStr = new Date().toISOString().split('T')[0];

            // --- 1. Fetch 7-Day Calendar Events (Isolated Explicit Columns) ---
            const upperLimit7 = new Date();
            upperLimit7.setDate(upperLimit7.getDate() + 7);
            const upperLimit7Str = upperLimit7.toISOString().split('T')[0];

            const { data: calendarData, error: calendarError } = await supabase
                .from('equi_calendar')
                // ⚡ FORCE clean isolated data extraction, ignoring any table cross-linking loops
                .select('id, calendar_title, calendar_date')
                .eq('user_uuid', session.user.id)
                .gte('calendar_date', todayStr)
                .lte('calendar_date', upperLimit7Str)
                .order('calendar_date', { ascending: true });

            if (calendarError) {
                console.error("Homepage calendar cache bypass log:", calendarError.message);
            } else if (calendarData) {
                setUpcomingEvents(calendarData as QuickEvent[]);
            }

            // --- 2. Fetch Horsebox and Evaluate 30-Day Deadlines ---
            const upperLimit30 = new Date();
            upperLimit30.setDate(upperLimit30.getDate() + 30);
            const upperLimit30Str = upperLimit30.toISOString().split('T')[0];

            const { data: horseboxData } = await supabase
                .from('equi_horsebox')
                .select('mot_date, insurance_date, service_date')
                .eq('user_uuid', session.user.id)
                .maybeSingle();

            if (horseboxData) {
                const alerts: HorseBoxAlert[] = [];

                const isWithin30Days = (dateStr: string | null) => {
                    if (!dateStr) return false;
                    return dateStr >= todayStr && dateStr <= upperLimit30Str;
                };

                if (isWithin30Days(horseboxData.mot_date)) {
                    alerts.push({ type: 'MOT', date: horseboxData.mot_date! });
                }
                if (isWithin30Days(horseboxData.insurance_date)) {
                    alerts.push({ type: 'Insurance', date: horseboxData.insurance_date! });
                }
                if (isWithin30Days(horseboxData.service_date)) {
                    alerts.push({ type: 'Service', date: horseboxData.service_date! });
                }

                setHorseBoxAlerts(alerts);
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
                        <Link to="/dashboard" className="buttonOrange buttonMain">Go to Your Stable</Link>
                    ) : (
                        <Link to="/login?mode=signup" className="buttonOrange buttonMain">Sign up now!</Link>
                    )}
                </div>
            </div>

            <div className="page-container home-layout-grid">

                    {session && (
                        <div className="section-container lightorange-section-container full-width">
                            <h2 className="textbig">Your upcoming events</h2>
                            {upcomingEvents.length > 0 ? (
                            <div>
                                <p className="marginbsixteen">
                                    <span>📅</span>{' '}-{' '}
                                    <strong className="text-normal">Next 7 Days:</strong>
                                </p>
                                <ul className="events-list">
                                    {upcomingEvents.map(event => (
                                        <li key={event.id} className="marginbsixteen">
                                            {/* 🛠️ Adjusted to match your edit component routing strategy path cleanly */}
                                            <Link to={`/calendar`} className="text-normal">
                                                {event.calendar_title}{' '}-{' '}
                                                <span>
                                                    ({new Date(event.calendar_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                    ) : (
                        <p className="marginbsixteen">
                            <span>📅</span>{' '}-{' '}
                            <strong className="text-normal">You have no entries in your calendar.</strong>
                        </p>
                    )}
                        </div>
                    )}




                {/* 🚛 UPCOMING HORSEBOX MAINTENANCE ALERTS (30 DAYS) */}
                {session && horseBoxAlerts.length > 0 && (
                    <div className="section-container lightorange-section-container full-width">
                        <h2 className="textbig">Horsebox Reminders</h2>
                        <div>
                            <p className="marginbsixteen">
                                <span>🚛</span>{' '}-{' '}
                                <strong className="text-normal">Due in the Next 30 Days:</strong>
                            </p>
                            <ul className="events-list">
                                {horseBoxAlerts.map((alert, index) => (
                                    <li key={index} className="marginbsixteen">
                                        <Link to={`/horsebox-view`} className="text-normal">
                                            ⚠️ Your Horsebox {alert.type} is due{' '}-{' '}
                                            <span>
                                                ({new Date(alert.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                )}

                {!session && (
                        <div className="section-container white-section-container full-width">
                            <div className="text-center">
                                <h2 className="textbig marginbsixteen">Opening an account and adding your horse's details is 100% free.</h2>
                                <p className="text-normal marginbsixteen">Store as much information as you need without spending a penny.</p>
                                <p className="text-normal marginbsixteen">If you want to activate your QR code so others can scan and view your horse's details, it's just £1 billed every month. See? Proof that not everything in the horse world has to be expensive.</p>
                                <p className="text-normal marginbsixteen">No Contracts: Cancel your QR code subscription at any time.</p>
                                <p className="text-normal marginbsixteen">Safe Keeping: Even if you pause your subscription, we’ll safely retain all your horse’s information in your account so you don't lose your data.</p>
                                <p className="text-normal marginbsixteen"><strong>What's not to like?</strong></p>
                                <p className="text-normal marginbsixteen"><a href="/about-us">About us</a></p>
                            </div>
                        </div>
                        )
                }

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

                {!session && (
                    <>
                        <div className="section-container white-section-container split-card">
                            <h2 className="textbig">How much does it cost.</h2>
                            <div className="pricing-content-wrapper">
                                <img className='marginbsixteen pricing-img' src={Money} alt='Pricing' />
                                <div className="pricing-text">
                                    <p className='marginbsixteen'>Opening an account and adding details is free. You can store all the information you need for your horse and we wont need a penny.</p>
                                    <p className='marginbsixteen'>If you wish to share your horse details via the QR code. We charge a <strong>monthly fee of £1</strong>.</p>
                                    <p className='marginbsixteen'>See, not all horse related things are expensive.</p>
                                    <p className='marginbsixteen'>You can cancel your QR code view anytime, and we will retain your horse information for you.</p>
                                    <p className='marginbsixteen'><strong>Whats not to like?</strong></p>
                                </div>
                            </div>
                        </div>

                        <div className="section-container white-section-container split-card">
                            <h2 className="textbig">Your NeighTag calendar.</h2>
                            <div className="pricing-content-wrapper">
                                <img className='marginbsixteen pricing-img' src={Calendar} alt="Calendar setup" />
                                <div className="pricing-text">
                                    <p className="text-normal marginbsixteen">When you sign up for our paid service, you can add your schedule to your NeighTag calendar. Clinics on Thursday, farrier next week, dentist in 4 weeks. Whatever you have, you can add it to our NeighTag calendar.</p>
                                    <p className="text-normal marginbsixteen">Get a message reminder a few days before so you dont forget those important dates.</p>
                                    {!session && (
                                        <Link to="/login?mode=signup" className="buttonWhite buttonMain">Sign up now!</Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main >
    );
}

export default Home;