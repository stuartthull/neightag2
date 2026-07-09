import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Home from './home';
import { supabase } from '../supabaseClient';

jest.mock(
    'react-router-dom',
    () => ({
        Link: ({ children, to, className }: { children: React.ReactNode; to: string; className?: string }) => (
            <a href={to} className={className}>
                {children}
            </a>
        ),
    }),
    { virtual: true }
);

jest.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
            onAuthStateChange: jest.fn(),
        },
        from: jest.fn(),
    },
}));

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockOnAuthStateChange = supabase.auth.onAuthStateChange as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

function mockSubscriptionQuery(data: unknown[], error: { message: string } | null = null) {
    const query = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue({ data, error }),
    };

    mockFrom.mockReturnValue(query);
}

describe('Home', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockOnAuthStateChange.mockReturnValue({
            data: {
                subscription: {
                    unsubscribe: jest.fn(),
                },
            },
        } as never);
    });

    it('hides reminder panels for signed-in users without an active subscription', async () => {
        mockGetSession.mockResolvedValue({
            data: {
                session: {
                    user: {
                        id: 'user-123',
                    },
                },
            },
        } as never);
        mockSubscriptionQuery([]);

        render(<Home />);

        await waitFor(() => {
            expect(mockFrom).toHaveBeenCalledWith('equi_subscriptions');
        });

        expect(screen.queryByText('Your upcoming events')).not.toBeInTheDocument();
        expect(screen.queryByText('Horsebox Reminders')).not.toBeInTheDocument();
    });
});
