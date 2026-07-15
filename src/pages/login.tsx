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

    // New states to handle inline messages and styling variables
    const [message, setMessage] = useState<string>('');
    const [isError, setIsError] = useState<boolean>(false);

    // Sync state with URL parameter on mount (e.g., /login?mode=signup)
    useEffect(() => {
        const mode = searchParams.get('mode');
        if (mode === 'signup') {
            setIsSignUp(true);
        } else {
            setIsSignUp(false);
        }
        // Clear old messages if the user toggles between sign up and login views
        setMessage('');
    }, [searchParams]);

    const handleAuth = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();
        setLoading(true);
        setMessage('');
        setIsError(false);

        try {
            if (isSignUp) {
                const normalizedEmail = email.trim().toLowerCase();
                const { data: availability, error: availabilityError } = await supabase.functions.invoke<{
                    registered: boolean;
                }>('check-email-availability', {
                    body: { email: normalizedEmail },
                });

                if (availabilityError) {
                    throw new Error('We could not check that email address. Please try again.');
                }

                if (availability?.registered) {
                    setIsError(true);
                    setMessage('An account with this email address already exists. Please log in or reset your password.');
                    return;
                }

                const { data, error } = await supabase.auth.signUp({ email: normalizedEmail, password });

                if (error) {
                    setIsError(true);
                    setMessage(`Oh no, we are sorry but ${error.message}`);
                    return;
                }

                if (data.user && data.user.identities?.length === 0) {
                    setIsError(true);
                    setMessage('An account with this email address already exists. Please log in or reset your password.');
                    return;
                }

                setIsError(false);
                setMessage('Great, you are almost in! Please check your inbox and click the confirmation link to activate your account.');
                return;
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });

                if (error) {
                    setIsError(true);

                    // Intercept the specific Supabase error message
                    if (error.message === 'Email not confirmed') {
                        setMessage('Your email address hasn\'t been verified yet. Please check your inbox (and spam folder) for the activation link.');
                    } else {
                        setMessage(error.message);
                    }

                    return;
                }

                navigate('/dashboard');
            }
        } catch (error: unknown) {
            setIsError(true);
            setMessage(error instanceof Error ? error.message : 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (email: string) => {
        setMessage('');
        setIsError(false);

        if (!email) {
            setIsError(true);
            setMessage("Please enter your email address first so we can send a reset link.");
            return;
        }

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://www.neightag.com/update-password',
        });

        if (error) {
            setIsError(true);
            setMessage(`Error: ${error.message}`);
        } else {
            setIsError(false);
            setMessage("Check your inbox! A secure password reset link has been dispatched.");
        }
    };

    return (
        <div className="page-wrapper">
            <main className="container">
                <div className="page-container">
                    <section className="section-container white-section-container">
                        <h2 className="textbig text-purple">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
                        <p className="text-normal marginbsixteen">
                            {isSignUp ? 'Sign up to start managing your data' : 'Login to see your stable dashboard'}
                        </p>

                        {/* ✅ INLINE MESSAGE DISPLAY BLOCK */}
                        {message && (
                            <div className={`message-banner ${isError ? 'message-error' : 'message-success'}`} style={{
                                padding: '12px 16px',
                                borderRadius: '6px',
                                marginBottom: '20px',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                backgroundColor: isError ? '#fdf2f2' : '#56483b',
                                color: isError ? '#de350b' : '#ffffff',
                                border: `1px solid ${isError ? '#f8b4b4' : '#56483b'}`
                            }}>
                                {message}
                            </div>
                        )}

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