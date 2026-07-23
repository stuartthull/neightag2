import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Faqs from './faqs';

jest.mock(
    'react-router-dom',
    () => ({
        Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
            <a href={to}>{children}</a>
        ),
    }),
    { virtual: true }
);

describe('Faqs', () => {
    it('renders the questions and expands an answer', () => {
        render(
            <HelmetProvider>
                <Faqs />
            </HelmetProvider>
        );

        expect(
            screen.getByRole('heading', { name: 'Frequently Asked Questions' })
        ).toBeInTheDocument();

        const question = screen.getByText('How does the NeighTag QR code work?');
        const answer = screen.getByText(/Your horse gets a unique QR code/);

        expect(answer).not.toBeVisible();

        fireEvent.click(question);

        expect(answer).toBeVisible();
    });
});
