import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './ManageVisibility.css'; // Creating a corresponding stylesheet next

export default function ManageVisibility() {
    const [horses, setHorses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHorses();
    }, []);

    const fetchHorses = async () => {
        const { data, error } = await supabase
            .from('equi_log_main')
            .select('id, horse_name, horse_breed, is_public')
            .order('horse_name', { ascending: true });

        if (error) console.error(error);
        else setHorses(data || []);
        setLoading(false);
    };

    const handleToggle = async (id, currentStatus) => {
        const nextStatus = !currentStatus;

        // Optimistically update UI local state
        setHorses(prev => prev.map(h => h.id === id ? { ...h, is_public: nextStatus } : h));

        // Commit change directly to Supabase remote instance
        const { error } = await supabase
            .from('equi_log_main')
            .update({ is_public: nextStatus })
            .eq('id', id);

        if (error) {
            alert("Failed to update status. Reverting modifications.");
            fetchHorses(); // Roll back to actual database state on failure
        }
    };

    if (loading) return <div className="loading">Loading Privacy Engine...</div>;

    return (
        <div className="page-wrapper">
            <main className="container text-padding">
                <h1 className="heading-title">Privacy Controls</h1>
                <p className="subtext">Toggle switches below to manage which equine records are visible to the public via directory search.</p>

                <div className="visibility-list">
                    {horses.map(horse => (
                        <div key={horse.id} className="visibility-card">
                            <div>
                                <h3 className="horse-item-name">🐴 {horse.horse_name}</h3>
                                <span className="small-label">{horse.horse_breed || 'Unknown Breed'}</span>
                            </div>

                            {/* CSS Toggle Switch Container */}
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={horse.is_public}
                                    onChange={() => handleToggle(horse.id, horse.is_public)}
                                />
                                <span className="slider round"></span>
                            </label>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
}