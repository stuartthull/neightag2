import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

interface ProtectedRouteProps {
    children: React.JSX.Element;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps): React.JSX.Element {
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        // Listen for realtime logouts/logins
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    if (loading) {
        return <div className="loading" style={{ padding: '40px', textAlign: 'center' }}>Verifying credentials...</div>;
    }

    // If no session exists, bounce them straight to the login page
    if (!session) {
        return <Navigate to="/login" replace />;
    }

    // If they are authenticated, render the dashboard
    return children;
}