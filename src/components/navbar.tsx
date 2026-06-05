import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
// @ts-ignore -- CSS side-effect import is resolved by the build tool
import '../css/equilog.css';
// @ts-ignore -- CSS side-effect import is resolved by the build tool
import '../css/reset.css'


export default function NavBar(): React.JSX.Element {
    const navigate = useNavigate();
    // Explicitly typed state for the Supabase Auth Session structure
    const [session, setSession] = useState<Session | null>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    // Sequentially handles logging out of Supabase and pushing back to root index
    const handleSignOut = async (): Promise<void> => {
        try {
            await supabase.auth.signOut();
            navigate('/'); // Redirection target back to root homepage
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <>
            {session ? (
                <>
                    <button
                        onClick={handleSignOut}
                        className="nav-btn-logout"
                    >
                        Sign Out
                    </button>
                </>
            ) : (
                <Link to="/login" className="nav-item">Login / Sign Up</Link>
            )}
        </>
    );
}