import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import HorseDetails from './horse-details';
import { supabase } from '../supabaseClient';

const horseUuid = '118840f6-fc7e-4edf-ac70-3040eca1aa86';
const mockNavigate = jest.fn();

jest.mock(
    'react-router-dom',
    () => ({
        useNavigate: () => mockNavigate,
        useParams: () => ({ horse_uuid: horseUuid }),
    }),
    { virtual: true }
);

jest.mock('../components/with-subscription-protection', () => ({
    __esModule: true,
    default: (Component: React.ComponentType) => Component,
}));

jest.mock('../supabaseClient', () => ({
    supabase: {
        auth: {
            getSession: jest.fn(),
        },
        from: jest.fn(),
        rpc: jest.fn(),
    },
}));

const mockGetSession = supabase.auth.getSession as jest.Mock;
const mockFrom = supabase.from as jest.Mock;
const mockRpc = supabase.rpc as jest.Mock;

const horseData = {
    id: 1,
    user_uuid: 'owner-123',
    horse_uuid: horseUuid,
    horse_name: 'Jane',
    horse_breed: 'Irish Sports Horse',
    horse_colour: 'Bay',
    emergency_name_one: 'Mandy',
    emergency_phone_one: '07123456789',
    emergency_name_two: 'Abs',
    emergency_phone_two: '07987654321',
    emergency_name_three: 'Jo',
    emergency_phone_three: '07876543210',
    horse_dob: '2015-04-12',
    horse_passport_number: 'SECRET-PASSPORT',
    horse_height: '16.2',
    horse_weight_kg: '540',
    horse_last_weighed: '2026-01-10',
    horse_vet_name: 'Yard Vet',
    horse_vet_practice: 'Neigh Vets',
    horse_vet_phone_one: '07000000000',
    horse_medication: 'Bute as required',
    horse_allergies: 'Dust allergy',
    saddle_fitter_name: 'Saddle name',
    saddle_fitter_phone: '0800123123',
    saddle_fitter_notes: 'Saddle fitter notes here',
    physio_name: 'Physio name',
    physio_phone: '0800321321',
    physio_notes: 'Physio notes here',
    farrier_name: 'Farrier name',
    farrier_phone_one: '0800667788',
    farrier_notes: 'Farrier notes here',
    dentist_name: 'Dentist name',
    dentist_phone_one: '0800998877',
    dentist_notes: 'Dentist notes here',
    feed_instructions: 'Morning hay',
    horse_behaviours: 'Can be nervous around tractors',
    horse_image_url: '',
    is_public: true,
};

const calendarData = [
    { calendar_title: 'Farrier Visit', calendar_date: '2026-02-01' },
    { calendar_title: 'Dentist Visit', calendar_date: '2026-03-02' },
    { calendar_title: 'Saddle Fitter Visit', calendar_date: '2026-04-03' },
    { calendar_title: 'Physio Visit', calendar_date: '2026-05-04' },
];

const privacyData = {
    show_name: true,
    show_emergency_name_one: true,
    show_emergency_phone_one: true,
    show_emergency_name_two: true,
    show_emergency_phone_two: true,
    show_emergency_name_three: true,
    show_emergency_phone_three: true,
    show_dob: true,
    show_passport: false,
    show_last_weighed: true,
    show_height: true,
    show_weight: true,
    show_breed: true,
    show_colour: true,
    show_vet_name: true,
    show_vet_practice: true,
    show_vet_phone: true,
    show_medication: true,
    show_allergies: true,
    show_farrier_name: true,
    show_farrier_phone_one: true,
    show_farrier_next: true,
    show_farrier_notes: true,
    show_dentist_name: true,
    show_dentist_phone: true,
    show_dentist_next: true,
    show_dentist_notes: true,
    show_saddle_fitter_name: true,
    show_saddle_fitter_phone: true,
    show_saddle_fitter_next: true,
    show_saddle_fitter_notes: true,
    show_physio_name: true,
    show_physio_phone: true,
    show_physio_next: true,
    show_physio_notes: true,
    show_feeding: true,
    show_horse_behaviours: true,
};

function mockSupabaseQueries(horse = horseData) {
    mockFrom.mockImplementation((table: string) => {
        if (table === 'equi_log_main') {
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                single: jest.fn().mockResolvedValue({ data: horse, error: null }),
            };
        }

        if (table === 'equi_log_show') {
            return {
                select: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnThis(),
                maybeSingle: jest.fn().mockResolvedValue({ data: privacyData, error: null }),
            };
        }

        throw new Error(`Unexpected table: ${table}`);
    });
    mockRpc.mockResolvedValue({ data: calendarData, error: null });
}

describe('HorseDetails', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetSession.mockResolvedValue({ data: { session: null } });
        mockSupabaseQueries();
    });

    it('renders every allowed public detail and hides private details', async () => {
        render(
            <HelmetProvider>
                <HorseDetails />
            </HelmetProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Emergency Protocols')).toBeInTheDocument();
        });

        expect(screen.getByText('Emergency Protocols')).toBeInTheDocument();
        expect(screen.getByText('Primary Contact:')).toBeInTheDocument();
        expect(screen.getByText('Mandy')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /07123456789/ })).toHaveAttribute(
            'href',
            'tel:07123456789'
        );
        expect(screen.getByText('Secondary Contact:')).toBeInTheDocument();
        expect(screen.getByText('Abs')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /07987654321/ })).toHaveAttribute(
            'href',
            'tel:07987654321'
        );
        expect(screen.getByText('Third Contact:')).toBeInTheDocument();
        expect(screen.getByText('Jo')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /07876543210/ })).toHaveAttribute(
            'href',
            'tel:07876543210'
        );

        expect(screen.getByText('Identity & Identification')).toBeInTheDocument();
        expect(screen.getByText('Irish Sports Horse')).toBeInTheDocument();
        expect(screen.getByText('Bay')).toBeInTheDocument();
        expect(screen.getByText('12 April 2015')).toBeInTheDocument();
        expect(screen.getByText('16.2 hh')).toBeInTheDocument();
        expect(screen.getByText('540 kg')).toBeInTheDocument();
        expect(screen.getByText('10 January 2026')).toBeInTheDocument();
        expect(screen.queryByText('SECRET-PASSPORT')).not.toBeInTheDocument();

        expect(screen.getByText('Veterinary Care')).toBeInTheDocument();
        expect(screen.getByText('Yard Vet')).toBeInTheDocument();
        expect(screen.getByText('Neigh Vets')).toBeInTheDocument();
        expect(screen.getByText(/07000000000/)).toBeInTheDocument();
        expect(screen.getByText('Bute as required')).toBeInTheDocument();
        expect(screen.getByText('Dust allergy')).toBeInTheDocument();

        expect(screen.getByText('Farrier')).toBeInTheDocument();
        expect(screen.getByText('Farrier name')).toBeInTheDocument();
        expect(screen.getByText(/0800667788/)).toBeInTheDocument();
        expect(screen.getByText('1 February 2026')).toBeInTheDocument();
        expect(screen.getByText('Farrier notes here')).toBeInTheDocument();

        expect(screen.getByText('Dentist')).toBeInTheDocument();
        expect(screen.getByText('Dentist name')).toBeInTheDocument();
        expect(screen.getByText(/0800998877/)).toBeInTheDocument();
        expect(screen.getByText('2 March 2026')).toBeInTheDocument();
        expect(screen.getByText('Dentist notes here')).toBeInTheDocument();

        expect(screen.getByText('Saddle Fitter')).toBeInTheDocument();
        expect(screen.getByText('Saddle name')).toBeInTheDocument();
        expect(screen.getByText(/0800123123/)).toBeInTheDocument();
        expect(screen.getByText('3 April 2026')).toBeInTheDocument();
        expect(screen.getByText('Saddle fitter notes here')).toBeInTheDocument();

        expect(screen.getByText('Physiotherapist')).toBeInTheDocument();
        expect(screen.getByText('Physio name')).toBeInTheDocument();
        expect(screen.getByText(/0800321321/)).toBeInTheDocument();
        expect(screen.getByText('4 May 2026')).toBeInTheDocument();
        expect(screen.getByText('Physio notes here')).toBeInTheDocument();
        expect(mockRpc).toHaveBeenCalledWith('get_horse_appointment_dates', {
            target_horse_uuid: horseUuid,
        });

        expect(screen.getByText('Feeding & Turnout')).toBeInTheDocument();
        expect(screen.getByText('Morning hay')).toBeInTheDocument();
        expect(screen.getByText('Horse Behaviours')).toBeInTheDocument();
        expect(screen.getByText('Can be nervous around tractors')).toBeInTheDocument();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('hides emergency contacts whose name and phone are blank', async () => {
        mockSupabaseQueries({
            ...horseData,
            emergency_name_two: ' ',
            emergency_phone_two: '',
        });

        render(
            <HelmetProvider>
                <HorseDetails />
            </HelmetProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Emergency Protocols')).toBeInTheDocument();
        });

        expect(screen.getByText('Primary Contact:')).toBeInTheDocument();
        expect(screen.queryByText('Secondary Contact:')).not.toBeInTheDocument();
        expect(screen.getByText('Third Contact:')).toBeInTheDocument();
    });
});
