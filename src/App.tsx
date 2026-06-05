import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import NavBar from './components/navbar';
import Home from './pages/home';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import EditItem from './pages/edit-horse';

// Your newly implemented views
import HorseDetails from './pages/horse-details';
import FieldPrivacy from './pages/field-privacy';
import ProtectedRoute from './components/protected-route';

const LogoSvg = () => {
    return (
        <svg viewBox="0 0 90.39 63.03" xmlns="http://www.w3.org/2000/svg"><path d="m39.86 13.28c-2.35-.21-5.77-1.31-7.8-2.52-.24-.14-.6-.22-.65-.55 4.31 1.14 9.27 1.61 13.73 1.32s6.66-1.95 11.41-1.55c.24.02.82.16.76-.21-2.05-.55-4.35-.84-6.47-.66-1.07.09-2.23.56-3.3.65-3.4.3-7.94-.08-10.43-2.63 1.07.29 2.14.64 3.24.82 5.93.96 11.76-1.52 17.72-1.03 2.53.21 5.26 1.22 7.58 2.19.08-1.54 1.03-2.56 2.41-3.07l-.43 3.07.99-1.76.54-.43c.03 1.06-.25 2.35.01 3.39.39 1.55 1.51 1.91-.02 3.85h-.43l.22-1.32c-.86.93-2.23.65-3.15 1.12-.84.43-1.56 1.69-1.68 2.61-.4.05-.19-.47-.16-.71.05-.39.18-1.1.31-1.45 1.07-2.87 6.66-.86 2.6-5.74l-1.12 1.5c-4.73-.69-9.13 2.56-13.43 4.15-3 1.11-6.61 2.07-9.81 2.26-6.22.38-11.81-1.89-17.96.26-1.59.56-3.03 1.44-4.56 2.14 2.09-2.28 5.53-3.87 8.56-4.5 4.78-1.01 9.9.16 14.79-.8l1.68-.41c-1.67-.11-3.51.15-5.16 0z" /><path d="m45.68 17.67-4.18.76c-6.33 1.86-11.97 5.69-18.6 6.64-6.21.89-11.61-.8-16.74-4.22l6.1 1.58c9.07 1.43 12.02-.51 19.91-3.45 4.42-1.65 8.84-1.78 13.51-1.31z" /><path d="m49.86 35.22c6.39-.15 14.14.64 19.6 4.22.3.2.88.53 1.03.83-7.41-1.8-14.94-5.25-22.62-2.51-1.62-1.89-1.3-5.6-3.52-7.03-1.87-1.2-3.9-.59-5.92-.34l1.42-.66c5.2-1.81 9.39-.38 10 5.48h.01z" /><path d="m71.81 24.04c-.05.34-.76.49-1.05.59-1.57.55-3.53.86-5.18.69-2.98-.29-2.77-1.45-6.21-.01-3.86 1.61-5.7 5.04-8.41 7.94 1.25-5.04 5.47-8.43 9.56-11.19-1.27-2.19-.72-4.81.64-6.81.12 1.36.06 2.55.54 3.84 1.46 3.96 6.26 5.2 10.1 4.94h.01z" /><path d="m82.85 26.95c-.18.29 0 .7-.38 1.05s-1.22.29-1.65.54c-.78.45-.33 1.44-2.08 1.19-2.64-.38-2.51-5.6-6.05-4.6 2.3-2.08 3.39 1.41 5.71.88-.27 1.69 1.01 3.45 1.32.88 2.22.89 1.47-.91 2.62-1.87-2.45-2.94-5.6-5.22-8-8.23-.79-.99-1.88-2.27-2.08-3.52 2.45 2.42 4.61 5.12 7.13 7.47 1.45 1.36 4.27 2.76 4.25 4.94-.01.99-.57.94-.77 1.27z" /><path d="m72.46 16.57c-1.19-.48-2.25-.64-3.07-1.75 1.16.34 2.94.13 3.07 1.75z" /><path d="m15.59 54.64h-3.8l-1.09-7.15-1.52 7.15h-3.8l2.41-11.4h3.8l1.09 7.17 1.52-7.17h3.8z" /><path d="m18.62 46.94c.09-.42.29-.76.62-1.02.32-.26.7-.4 1.12-.4h6.08c.42 0 .73.13.93.4.2.26.26.61.17 1.02l-1.09 5.19h-5.4l-.28 1.26h5.4l-.26 1.26h-7.14c-.54 0-.94-.16-1.2-.49s-.33-.76-.21-1.3zm3.57-.17-.88 4.06h1.9l.88-4.06z" /><path d="m30.88 54.64h-3.52l1.93-9.12h3.52zm2.15-10.15h-3.52l.26-1.26h3.52z" /><path d="m33.83 55.66h3.63l.21-1.02h-3.63c-.54 0-.94-.16-1.2-.49s-.33-.76-.21-1.3l1.26-5.92c.09-.42.29-.76.61-1.02s.69-.4 1.11-.4h7.5l-2.03 9.62c-.12.54-.38.97-.78 1.3-.4.32-.86.49-1.39.49h-5.37l.28-1.26zm3.62-8.89-1.4 6.61h1.9l1.4-6.61z" /><path d="m51.56 54.64h-3.5l1.67-7.86h-1.9l-1.67 7.86h-3.52l2.41-11.4h3.52l-.48 2.28h3.98c.42 0 .73.13.94.4s.27.61.18 1.02z" /><path d="m64.35 44.66h-2.84l-2.11 9.98h-3.8l2.11-9.98h-2.84l.3-1.42h9.48z" /><path d="m72.31 54.64h-7.12c-.54 0-.94-.16-1.2-.49s-.33-.76-.21-1.3l.71-3.39c.09-.42.29-.76.61-1.02s.69-.4 1.11-.4h4l.28-1.27h-3.67l.26-1.26h5.75c.42 0 .73.13.93.4.2.26.26.61.17 1.02l-1.63 7.7zm-4.26-5.32-.88 4.06h1.9l.88-4.06z" /><path d="m75.3 55.66h3.63l.21-1.02h-3.63c-.54 0-.94-.16-1.2-.49s-.33-.76-.21-1.3l1.26-5.92c.09-.42.29-.76.61-1.02s.69-.4 1.11-.4h7.5l-2.03 9.62c-.12.54-.38.97-.78 1.3-.4.32-.86.49-1.39.49h-5.37l.28-1.26zm3.62-8.89-1.4 6.61h1.9l1.4-6.61z" /></svg>)
}

const HamburgerSvg = () => {
    return (
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><rect height="4.41" rx="1.11" width="38.6" x="4.99" y="5.6" /><rect height="4.41" rx="1.11" width="38.6" x="4.99" y="21.52" /><rect height="4.41" rx="1.11" width="38.6" x="4.99" y="37.44" /></svg>
    )
}

export default function App() {
    return (

        <Router>
            <div className="container">

                <Navigation />

                <Routes>
                    {/* Public Global Views */}
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />

                    {/* Dynamic Parameterized Route for single-horse public/owner views */}
                    <Route path="/horse/:id" element={<HorseDetails />} />

                    {/* Protected Owner/Dashboard Operations */}
                    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                    <Route path="/edit/:id" element={<ProtectedRoute><EditItem /></ProtectedRoute>} />

                    {/* Route for handling field-by-field privacy switches */}
                    <Route path="/privacy/:id" element={<ProtectedRoute><FieldPrivacy /></ProtectedRoute>} />
                </Routes>
            </div>
        </Router >

    );
}

const Navigation = () => {
    return (
        <nav className="navigation">
            <Link className="logo-holder" to="/">
                <span className="neightag-logo">
                    <LogoSvg />
                    <p className="logo-text">
                        for all your livery needs
                    </p>
                </span>
            </Link>
            <div className="nav-buttons">
                <NavBar />
                <Link to="/dashboard" className="nav-link">
                    <HamburgerSvg />
                    <span className="nav-link-text">Menu</span>
                </Link>

            </div>
        </nav>
    );
};