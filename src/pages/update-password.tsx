import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

export default function UpdatePassword() {
    const [newPassword, setNewPassword] = useState('');
    const [updating, setUpdating] = useState(false);
    const navigate = useNavigate();

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);

        // 🔒 Supabase takes the active session and overwrites the password hash
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        setUpdating(false);

        if (error) {
            alert(`Update failed: ${error.message}`);
        } else {
            alert("Password updated successfully!");
            navigate('/dashboard'); // Take them back to their stable roster
        }
    };

    return (
        <div className="page-container" style={{ maxWidth: '400px', margin: '40px auto' }}>
            <section className="section-container white-section-container purple-border">
                <h2 className="textmedium marginbsixteen">Create New Password</h2>
                <form onSubmit={handlePasswordUpdate}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }} className="marginbsixteen">
                        <label className="form-field-label" htmlFor="new-password">New Secure Password</label>
                        <input
                            id="new-password"
                            type="password"
                            className="form-input-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Minimum 6 characters"
                            required
                            minLength={6}
                        />
                    </div>
                    <button type="submit" disabled={updating} className="buttonPurple buttonMain" style={{ width: '100%' }}>
                        {updating ? 'Saving New Password...' : 'Update Password'}
                    </button>
                </form>
            </section>
        </div>
    );
}