import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Helmet, HelmetProvider } from 'react-helmet-async';

import NavBar from './components/navbar';
import Home from './pages/home';
import Login from './pages/login';
import Dashboard from './pages/dashboard';
import EditItem from './pages/edit-horse';
import ContactUs from './pages/contact-us';

// Your newly implemented views
import HorseDetails from './pages/horse-details';
import FieldPrivacy from './pages/field-privacy';
import ProtectedRoute from './components/protected-route';
import CalendarView from './pages/view-calendar';
import AddCalendarEntry from './pages/add-calendar';
import EditCalendarEntry from './pages/edit-calendar';
import HorseboxView from './pages/horsebox-view';
import HorseboxEdit from './pages/horsebox-edit';
import UpdatePassword from './pages/update-password';
import AboutUs from './pages/about-us';
import ScrollToTop from './components/scroll-to-top';
import Footer from './components/footer';
import WhatDoYouGet from './pages/what-do-you-get';
import CookiePolicy from './pages/cookie-policy';
import PrivacyPolicy from './pages/privacy-policy';
import PrintStableTag, { DummyPrintStableTag } from './pages/print-stable-tag';
import PrintHorseboxPoster, { DummyPrintHorseboxPoster } from './pages/print-horsebox-poster';
import BuyTag from './pages/buy-tag';
import OwnerHorseDetails from './pages/owner-horse-details';
import CookieConsentBanner from './components/cookie-consent-banner';
import AddBookmark from './pages/add-bookmark';
import ShowQr from './pages/show-qr';
import Shop from './pages/shop/shop';
import TapTag from './pages/shop/tap-tag';
import LaminatedStableTag from './pages/shop/laminated-stable-tag';
import Faqs from './pages/faqs';

import mainLogo from './assets/main-logo.png';
import HighGlossStableTag from './pages/shop/high-gloss-stable-tag';

const HamburgerSvg = () => {
    return (
        <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path d="m1.87 11.46-.04 33.99h44.71l-.04-33.99-22.34-9.36zm11.35 31.22v-.39c.12-3.56.61-6.98 1.48-10.15 1.45-5.28 4.58-11.78 11.27-12.74.92-.13 1.81-.15 2.85-.16.03-.06.05-.12.08-.18.11-.25.22-.5.37-.71.19-.27.59-.69.87-.98.24-.25.51-.48.77-.71l.62-.52v3.32l1.57 3.2-.78-.19c-.7-.17-1.22.21-1.47.63-.25.43-.35 1.08.16 1.64.27.3.64.46 1.04.45.42-.01.82-.22 1.09-.57.09-.2.19-.41.42-.45l.19-.04.26.25 2.74 5.57s.1.1.19.19c.35.37.79.83.73 1.35-.03.23-.45 1.01-.73 1.14-.3.14-.68.05-1-.02l-.12-.03c-2.2-.45-4.94-1.86-6.09-3.97-.4-.73-.59-1.55-.78-2.35-.04-.18-.09-.36-.13-.54-.02.01-.04.03-.06.04l-.28.16c-.93.53-1.98 1.13-2.65 1.87-2.48 2.73-1.05 6.14.33 9.44.74 1.75 1.43 3.41 1.61 5.01l.05.42h-14.59zm30.55-29.36.03 29.36h-13.27v-.36c-.07-1.79-.71-3.54-1.31-5.04-.17-.43-.38-.89-.59-1.35-.58-1.29-1.18-2.63-1.36-3.93-.17-1.2.07-1.34.2-1.42l.22-.13.35.25c1.3 1.91 3.16 3.31 5.51 4.17 2.97 1.08 4.78.77 6.05-1.05 1.3-1.88 1.12-3.58-.59-5.53l-.05-.08-4.66-9.5v-5.98c-.16 0-.32 0-.48 0-.29 0-.58-.01-.88 0-1.16.05-2.09.29-2.92.75-.78.43-1.49 1.09-2.22 2.08l-.11.15h-.19c-1.72.02-3.25.23-4.7.65-7.86 2.3-11.28 10.48-12.76 16.93-.66 2.88-1.06 5.92-1.18 9.04v.36h-4.29l.02-29.35 19.57-8.25 19.6 8.23z" />
        </svg>
    );
};

const HIDE_CHROME_ROUTES = [
    '/print-stable-tag',
    '/print-stable-tag-dummy',
    '/print-horsebox-poster',
    '/print-horsebox-poster-dummy',
];
const SITE_URL = 'https://www.neightag.com';

function CanonicalLink(): React.JSX.Element {
    const location = useLocation();
    const path = location.pathname === '/' ? '/' : location.pathname.replace(/\/+$/, '');
    const canonicalUrl = `${SITE_URL}${path}`;

    return (
        <Helmet>
            <link rel="canonical" href={canonicalUrl} />
        </Helmet>
    );
}

function AppContent(): React.JSX.Element {
    const location = useLocation();
    const isHorseDetailsRoute = location.pathname.startsWith('/horse-details/');
    const hideAllChrome = HIDE_CHROME_ROUTES.includes(location.pathname);
    const showHeader = !hideAllChrome && !isHorseDetailsRoute;
    const showFooter = !hideAllChrome;

    return (
        <div className="container">
            <CanonicalLink />
            {showHeader && <Navigation />}

            <Routes>
                {/* Public Global Views */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/update-password" element={<UpdatePassword />} />
                <Route path="/about-us" element={<AboutUs />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/what-you-get" element={<WhatDoYouGet />} />
                <Route path="/cookie-policy" element={<CookiePolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/activate-tag" element={<BuyTag />} />
                <Route path="/add-bookmark" element={<AddBookmark />} />
                <Route path="/show-qr" element={<ShowQr />} />
                <Route path="/show-qr/:horse_uuid" element={<ShowQr />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/shop/taptag" element={<TapTag />} />
                <Route path="/shop/laminated-stable-tag" element={<LaminatedStableTag />} />
                <Route path="/shop/high-gloss-stable-tag" element={<HighGlossStableTag />} />
                <Route path="/faqs" element={<Faqs />} />

                {/* Dynamic Parameterized Route for single-horse public/owner views */}
                <Route path="/horse-details/:horse_uuid" element={<HorseDetails />} />
                <Route
                    path="/owner-horse-details/:horse_uuid"
                    element={
                        <ProtectedRoute>
                            <OwnerHorseDetails />
                        </ProtectedRoute>
                    }
                />

                {/* Protected Owner/Dashboard Operations */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/edit-horse/:horse_uuid"
                    element={
                        <ProtectedRoute>
                            <EditItem />
                        </ProtectedRoute>
                    }
                />

                {/* Route for handling field-by-field privacy switches */}
                <Route
                    path="/privacy/:horse_uuid"
                    element={
                        <ProtectedRoute>
                            <FieldPrivacy />
                        </ProtectedRoute>
                    }
                />

                {/* Route for handling horse box */}
                <Route
                    path="/horsebox-view"
                    element={
                        <ProtectedRoute>
                            <HorseboxView />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/horsebox/edit"
                    element={
                        <ProtectedRoute>
                            <HorseboxEdit />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/print-stable-tag"
                    element={
                        <ProtectedRoute>
                            <PrintStableTag />
                        </ProtectedRoute>
                    }
                />
                <Route path="/print-stable-tag-dummy" element={<DummyPrintStableTag />} />
                <Route
                    path="/print-horsebox-poster"
                    element={
                        <ProtectedRoute>
                            <PrintHorseboxPoster />
                        </ProtectedRoute>
                    }
                />
                <Route path="/print-horsebox-poster-dummy" element={<DummyPrintHorseboxPoster />} />

                {/* 🔒 Protected Calendar Schedule Routes */}
                <Route
                    path="/calendar"
                    element={
                        <ProtectedRoute>
                            <CalendarView />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/calendar/add"
                    element={
                        <ProtectedRoute>
                            <AddCalendarEntry />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/calendar/edit/:id"
                    element={
                        <ProtectedRoute>
                            <EditCalendarEntry />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Home />} />
            </Routes>

            {!hideAllChrome && <CookieConsentBanner />}

            {showFooter && <Footer />}
        </div>
    );
}

export default function App() {
    return (
        <HelmetProvider>
            <Router>
                <ScrollToTop />
                <AppContent />
            </Router>
        </HelmetProvider>
    );
}

const Navigation = () => {
    return (
        <nav className="navigation no-print">
            <div className="navholder">
                <a href="/" className="logo-holder">
                    <span className="neightag-logo">
                        <img src={mainLogo} alt="Main Logo" className="logo-image" />
                    </span>
                </a>
                <div className="nav-buttons">
                    <NavBar />
                    <Link to="/dashboard" className="nav-link">
                        <HamburgerSvg />
                        <span className="nav-link-text">Your Stable</span>
                    </Link>
                </div>
            </div>
            <p className="logo-text">For all your livery needs</p>
        </nav>
    );
};
