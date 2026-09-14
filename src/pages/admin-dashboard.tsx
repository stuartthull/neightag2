import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './admin-dashboard.css';

type AdminCustomerRow = {
    user_id: string;
    user_email: string | null;
    user_created_at: string;
    horse_id: number;
    horse_uuid: string;
    horse_name: string | null;
    subscription_status: string | null;
    subscription_expires_at: string | null;
    stripe_customer_id: string | null;
};

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
});

function formatDate(value: string | null): string {
    if (!value) return 'Not subscribed';
    return dateFormatter.format(new Date(value));
}

function statusLabel(status: string | null): string {
    return status ? status.replace(/_/g, ' ') : 'No subscription';
}

export default function AdminDashboard(): React.JSX.Element {
    const navigate = useNavigate();
    const [rows, setRows] = useState<AdminCustomerRow[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        let isMounted = true;

        const loadOverview = async () => {
            const { data: userData } = await supabase.auth.getUser();
            const user = userData.user;

            if (!user || user.app_metadata?.role !== 'admin') {
                navigate('/dashboard', { replace: true });
                return;
            }

            const { data, error: overviewError } = await supabase.rpc('get_admin_customer_overview');

            if (!isMounted) return;
            if (overviewError) {
                setError(overviewError.message);
            } else {
                setRows((data as AdminCustomerRow[]) || []);
            }
            setLoading(false);
        };

        loadOverview();
        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const filteredRows = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return rows;

        return rows.filter((row) =>
            [row.user_email, row.user_id, row.horse_uuid, row.horse_name, String(row.horse_id)]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(query))
        );
    }, [rows, search]);

    const activeSubscriptions = rows.filter((row) => row.subscription_status === 'active').length;
    const customerCount = new Set(rows.map((row) => row.user_id)).size;

    if (loading) {
        return <main className="admin-page"><p className="admin-state">Loading customer overview...</p></main>;
    }

    if (error) {
        return <main className="admin-page"><p className="admin-error">Could not load the customer overview: {error}</p></main>;
    }

    return (
        <main className="admin-page">
            <header className="admin-header">
                <div>
                    <p className="admin-eyebrow">NeighTag operations</p>
                    <h1>Customer overview</h1>
                    <p className="admin-intro">Account, horse and subscription records in one place.</p>
                </div>
                <button type="button" className="admin-refresh" onClick={() => window.location.reload()}>
                    Refresh data
                </button>
            </header>

            <section className="admin-stats" aria-label="Overview statistics">
                <div><strong>{customerCount}</strong><span>Customers</span></div>
                <div><strong>{rows.length}</strong><span>Horses</span></div>
                <div><strong>{activeSubscriptions}</strong><span>Active subscriptions</span></div>
            </section>

            <section className="admin-table-panel">
                <div className="admin-table-toolbar">
                    <label htmlFor="admin-search">Search records</label>
                    <input
                        id="admin-search"
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Email, user ID, horse name or horse UUID"
                    />
                    <span>{filteredRows.length} of {rows.length} records</span>
                </div>

                <div className="admin-table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>User email</th>
                                <th>User ID</th>
                                <th>Horse</th>
                                <th>Horse UUID</th>
                                <th>Account created</th>
                                <th>Subscription</th>
                                <th>Expiry</th>
                                <th>Stripe customer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRows.map((row) => (
                                <tr key={row.horse_uuid}>
                                    <td>{row.user_email || 'No email'}</td>
                                    <td className="admin-mono">{row.user_id}</td>
                                    <td>{row.horse_name || 'Unnamed horse'}</td>
                                    <td className="admin-mono">
                                        <a href={`/show-qr/${row.horse_uuid}`} className="admin-horse-link" target="_blank" rel="noopener noreferrer">
                                            {row.horse_uuid}
                                        </a>
                                    </td>
                                    <td>{formatDate(row.user_created_at)}</td>
                                    <td><span className={`admin-status status-${row.subscription_status || 'none'}`}>{statusLabel(row.subscription_status)}</span></td>
                                    <td>{formatDate(row.subscription_expires_at)}</td>
                                    <td className="admin-mono">{row.stripe_customer_id || 'Not linked'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredRows.length === 0 && <p className="admin-state">No matching records.</p>}
                </div>
            </section>
        </main>
    );
}
