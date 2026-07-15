import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Shop from './shop';
import { supabase } from '../supabaseClient';

jest.mock(
    'react-router-dom',
    () => ({
        useSearchParams: () => [new URLSearchParams()],
    }),
    { virtual: true }
);

jest.mock('../supabaseClient', () => ({
    supabase: {
        functions: {
            invoke: jest.fn(),
        },
    },
}));

const mockInvoke = supabase.functions.invoke as jest.Mock;

describe('Shop', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('shows a checkout error when Stripe Checkout cannot be opened', async () => {
        mockInvoke.mockResolvedValue({
            data: null,
            error: { message: 'Checkout is temporarily unavailable.' },
        });

        render(
            <HelmetProvider>
                <Shop />
            </HelmetProvider>
        );

        fireEvent.click(screen.getByRole('button', { name: 'Buy TapTag' }));

        expect(
            await screen.findByText('Checkout is temporarily unavailable.')
        ).toBeInTheDocument();
        expect(mockInvoke).toHaveBeenCalledWith('create-product-checkout');
    });
});
