import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { supabase } from '../supabaseClient';
import '../css/equilog.css'; // Import the new matching styles

export default function NavBar() {
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
        return () => subscription.unsubscribe();
    }, []);

    return (
        <nav className="navbar">
            <div className="nav-container">
                {/* Brand / Logo side */}
                <Link to="/" className="nav-brand">🐴 EquiLog</Link>

                {/* Navigation links side */}
                <div className="nav-links">
                    <Link to="/" className="nav-item">Home</Link>
                    {session ? (
                        <>
                            <Link to="/dashboard" className="nav-item">My Dashboard</Link>
                            <button
                                onClick={() => supabase.auth.signOut()}
                                className="nav-btn-logout"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-item">Login / Sign Up</Link>
                    )}
                </div>
            </div>
        </nav>
    );
}