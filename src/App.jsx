import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './components/navbar';
import Home from './pages/home';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import EditItem from './pages/edit-horse';

// Your newly implemented views
import HorseDetails from './pages/horse-details';
import FieldPrivacy from './pages/field-privacy';

export default function App() {
    return (
        <Router>
            {/* Dynamic Navigation Bar persists across all pages */}
            <NavBar />

            <Routes>
                {/* Public Global Views */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />

                {/* Dynamic Parameterized Route for single-horse public/owner views */}
                <Route path="/horse/:id" element={<HorseDetails />} />

                {/* Protected Owner/Dashboard Operations */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/edit/:id" element={<EditItem />} />

                {/* Route for handling field-by-field privacy switches */}
                <Route path="/privacy/:id" element={<FieldPrivacy />} />
            </Routes>
        </Router>
    );
}