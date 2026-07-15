import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import Login from './login';
import { supabase } from '../supabaseClient';

const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
        useSearchParams: () => [new URLSearchParams('mode=signup')],
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
