import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Login(): React.JSX.Element {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [loading, setLoading] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [isSignUp, setIsSignUp] = useState<boolean>(false);

    // Sync state with URL parameter on mount (e.g., /login?mode=signup)
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') {
            setIsSignUp(true);
        } else {
            setIsSignUp(false);
        }
    }, [searchParams]);

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Great, you are in. we wont keep your details after the trial.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
Mo
            // ✅ Only navigate home if auth is completely successful
            navigate('/dashboard');
        } catch (error: any) {
            alert(error.error_description || error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (email: string) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://www.neightag.com/update-password',
        });

        if (error) {
            alert(`Error: ${error.message}`);
        } else {
            alert("Check your inbox! A secure password reset link has been dispatched.");
        }
    };

    return (
        <div className="page-wrapper">
            <main className="container">
                <div className="page-container">
                    <section className="section-container white-section-container">
                        <h2 className="textbig text-purple">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                        <p className="text-normal marginbsixteen">
                            {isSignUp ? 'Sign up to start managing your data' : 'Login to edit your entries'}
                        </p>

                        <form onSubmit={handleAuth}>
                            <div className="marginbsixteen">
                                <label className="labelForm labelFormIntense" htmlFor="email">Email address</label>
                                <input
                                    id="email"
                                    className="inputText"
                                    type="email"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="marginbsixteen">
                                <label className="labelForm labelFormIntense" htmlFor="password">Password</label>
                                <input
                                    id="password"
                                    className="inputText"
                                    type="password"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" disabled={loading} className="buttonMain buttonPurple">
                                {loading ? 'Processing...' : isSignUp ? 'Sign Up' : 'Login'}
                            </button>
                        </form>

                        <button
                            className="buttonaslinker"
                            onClick={() => {
                                const nextMode = !isSignUp;
                                setIsSignUp(nextMode);
                                // Sync the URL parameters with the newly toggled state
                                if (nextMode) {
                                    navigate('/login?mode=signup', { replace: true });
                                } else {
                                    navigate('/login', { replace: true });
                                }
                            }}
                        >
                            {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
                        </button>
                        <br /><br />
                        <button
                            type="button"
                            className="buttonaslinker"
                            onClick={() => handleForgotPassword(email)}
                        >
                            Forgot your password?
                        </button>

                    </section>
                </div>
            </main>
        </div>
    );
}
