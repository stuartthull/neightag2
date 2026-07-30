import React from 'react';
import { render, screen } from '@testing-library/react';
import BuyTag from './buy-tag';
import { supabase } from '../supabaseClient';

jest.mock(
    'react-router-dom',
    () => ({
        useSearchParams: () => [new URLSearchParams('id=horse-123')],
    }),
    { virtual: true }
);

jest.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            getUser: jest.fn(),
            getSession: jest.fn(),
        },
        from: jest.fn(),
    },
    supabaseAnonKey: 'test-anon-key',
}));

jest.mock('../components/local-price', () => ({
    LocalPrice: () => <span>£11.00</span>,
}));

const mockGetUser = supabase.auth.getUser as jest.Mock;
const mockFrom = supabase.from as jest.Mock;

const buildHorseQuery = (horse: { horse_uuid: string } | null) => {
    const query = {
        select: jest.fn(),
        eq: jest.fn(),
        maybeSingle: jest.fn().mockResolvedValue({ data: horse, error: null }),
    };
    query.select.mockReturnValue(query);
    query.eq.mockReturnValue(query);
    return query;
};

describe('BuyTag', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetUser.mockResolvedValue({
            data: { user: { id: 'user-123' } },
            error: null,
        });
    });

    it('enables checkout when the URL horse belongs to the signed-in user', async () => {
        const query = buildHorseQuery({ horse_uuid: 'horse-123' });
        mockFrom.mockReturnValue(query);

        render(<BuyTag />);

        expect(
            await screen.findByRole('button', { name: 'Subscribe for £11.00 a year' })
        ).toBeEnabled();
        expect(mockFrom).toHaveBeenCalledWith('equi_log_main');
        expect(query.eq).toHaveBeenNthCalledWith(1, 'horse_uuid', 'horse-123');
        expect(query.eq).toHaveBeenNthCalledWith(2, 'user_uuid', 'user-123');
    });

    it('blocks checkout when the URL horse belongs to another user', async () => {
        mockFrom.mockReturnValue(buildHorseQuery(null));

        render(<BuyTag />);

        expect(
            await screen.findByText('❌ This horse does not belong to your account.')
        ).toBeVisible();
        expect(screen.getByRole('button', { name: 'Subscribe for £11.00 a year' })).toBeDisabled();
    });
});
