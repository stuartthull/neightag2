import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from './login';
import { supabase } from '../supabaseClient';

const mockNavigate = jest.fn();
let mockSearchParams = new URLSearchParams('mode=signup');

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
        useSearchParams: () => [mockSearchParams],
    }),
    { virtual: true }
);

jest.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            signUp: jest.fn(),
            signInWithPassword: jest.fn(),
            resetPasswordForEmail: jest.fn(),
        },
        functions: {
            invoke: jest.fn(),
        },
    },
}));

const mockInvoke = supabase.functions.invoke as jest.Mock;
const mockSignUp = supabase.auth.signUp as jest.Mock;

describe('Login signup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams = new URLSearchParams('mode=signup');
    });

    it('shows an error and does not sign up when the email is already registered', async () => {
        mockInvoke.mockResolvedValue({ data: { registered: true }, error: null });

        render(<Login />);

        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'Existing@Example.com ' },
        });
        fireEvent.change(screen.getByLabelText('Password'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        expect(await screen.findByText(/account with this email address already exists/i)).toBeInTheDocument();
        expect(mockInvoke).toHaveBeenCalledWith('check-email-availability', {
            body: { email: 'existing@example.com' },
        });
        expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('continues with signup when the email is available', async () => {
        mockInvoke.mockResolvedValue({ data: { registered: false }, error: null });
        mockSignUp.mockResolvedValue({
            data: { user: { identities: [{ id: 'identity-1' }] } },
            error: null,
        });

        render(<Login />);

        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'New@Example.com ' },
        });
        fireEvent.change(screen.getByLabelText('Password'), {
            target: { value: 'password123' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Sign Up' }));

        await waitFor(() => {
            expect(mockSignUp).toHaveBeenCalledWith({
                email: 'new@example.com',
                password: 'password123',
            });
        });
        await waitFor(() => {
            expect(screen.getByText(/please check your inbox/i)).toBeInTheDocument();
        });
    });
});

describe('Forgotten password', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams = new URLSearchParams();
    });

    it('shows an email-only form and sends a reset link', async () => {
        const mockResetPassword = supabase.auth.resetPasswordForEmail as jest.Mock;
        mockResetPassword.mockResolvedValue({ error: null });

        render(<Login />);

        fireEvent.click(screen.getByRole('button', { name: 'Forgot your password?' }));

        expect(screen.queryByLabelText('Password')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Email address')).toBeInTheDocument();

        fireEvent.change(screen.getByLabelText('Email address'), {
            target: { value: 'User@Example.com ' },
        });
        fireEvent.click(screen.getByRole('button', { name: 'Send Reset Link' }));

        await waitFor(() => {
            expect(mockResetPassword).toHaveBeenCalledWith('user@example.com', {
                redirectTo: 'https://www.neightag.com/update-password',
            });
        });
        expect(await screen.findByText(/secure password reset link/i)).toBeInTheDocument();
    });
});
