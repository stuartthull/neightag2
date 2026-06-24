import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer(): React.JSX.Element {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="main-footer">
            <div className="footer-container">

                {/* Brand / Copyright Info */}
                <div className="footer-brand">
                    <p className="text-normal footer-title">NeighTag 🐴</p>
                    <p className="text-normal footer-copyright">
                        &copy; {currentYear} NeighTag. All rights reserved.
                    </p>
                </div>

                {/* Navigation Links */}
                <ul className="footer-links">
                    <li>
                        <Link to="/" className="text-normal footer-link">Home</Link>
                    </li>
                    <li>
                        <Link to="/what-you-get" className="text-normal footer-link">What do you get?</Link>
                    </li>
                    <li>
                        <Link to="/about-us" className="text-normal footer-link">About Us</Link>
                    </li>
                    <li>
                        <Link to="/contact-us" className="text-normal footer-link">Contact Us</Link>
                    </li>
                    <li>
                        <Link to="/cookie-policy" className="text-normal footer-link">Cookies</Link>
                    </li>
                </ul>

            </div>
        </footer>
    );
}