import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer(): React.JSX.Element {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="main-footer">
            <div className="footer-container">

                {/* Brand / Copyright Info */}
                <div className="footer-brand">
                    <p className="text-normal footer-title">NeighTag</p>
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
                    <li>
                        <Link to="/privacy-policy" className="text-normal footer-link">Privacy Policy</Link>
                    </li>
                </ul>

            </div>
            <div className="social-container">
                <a href="https://www.facebook.com/profile.php?id=61591144586371" target="_blank" rel="noopener noreferrer"
                   className="footer-coffee-button">
                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m22 12c0-5.52-4.48-10-10-10s-10 4.48-10 10c0 4.99 3.66 9.13 8.44 9.88s0 0-.01-.01v-6.98h-2.53s-.01-.01-.01-.01v-2.89h2.54v-2.2c0-2.51 1.5-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2s.01.01.01.01v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.87h2.76s.01.01.01.01l-.44 2.89h-2.33v6.99c4.78-.75 8.44-4.89 8.44-9.88h-.01z" /></svg>
                    Facebook
                </a>
                <a href="https://www.instagram.com/neigh_tag/" target="_blank" rel="noopener noreferrer"
                   className="footer-coffee-button">
                    <svg data-gui="atds-icon-actions-icon" xmlns="http://www.w3.org/2000/svg" height="24" width="24"
                         viewBox="0 0 24 24" fill="#242D3D" className="atds-icon-svg"><title>Actions icon</title>
                        <path
                            d="M20.03 7.30998V7.28998V6.56998C19.13 6.56998 18.24 6.30998 17.49 5.81998C16.75 4.98998 16.34 3.91998 16.34 2.80998H15.44C15.39 2.53998 15.37 2.25998 15.37 1.97998H12.01V15.2C11.95 16.69 10.71 17.87 9.20001 17.87C8.75001 17.87 8.30001 17.76 7.90001 17.55H7.89001C7.27001 16.7 7.19001 15.59 7.67001 14.67C8.15001 13.74 9.12001 13.16 10.18 13.16C10.46 13.16 10.74 13.21 11.01 13.29V9.92998C10.73 9.88998 10.46 9.86998 10.18 9.86998H10.03V9.09998C9.75001 9.05998 9.48001 9.02998 9.20001 9.02998C6.50001 9.02998 4.11001 10.74 3.30001 13.28C2.52001 15.73 3.39001 18.4 5.46001 19.94C5.52001 20.01 5.79001 20.24 5.86001 20.29C7.59001 21.96 10.16 22.48 12.43 21.6C14.79 20.69 16.34 18.45 16.34 15.95V9.24998C17.7 10.21 19.33 10.72 21.01 10.72V7.42998C20.68 7.42998 20.36 7.38998 20.04 7.32998L20.03 7.30998Z"></path>
                    </svg>
                    TikTok
                </a>
                <a href="https://www.tiktok.com/@neightagqr" target="_blank" rel="noopener noreferrer"
                   className="footer-coffee-button">
                    <svg data-gui="atds-icon-actions-icon" xmlns="http://www.w3.org/2000/svg" height="24" width="24"
                         viewBox="0 0 24 24" fill="#242D3D" className="atds-icon-svg"><title>Actions icon</title>
                        <path
                            d="M12 4.65C14.4 4.65 14.69 4.65 15.64 4.7C16.52 4.74 16.99 4.89 17.31 5.02C17.73 5.19 18.03 5.38 18.34 5.71C18.65 6.03 18.85 6.34 19.01 6.76C19.13 7.08 19.28 7.57 19.32 8.46C19.36 9.43 19.37 9.72 19.37 12.16C19.37 14.6 19.37 14.9 19.32 15.86C19.28 16.75 19.13 17.24 19.01 17.56C18.85 17.99 18.65 18.29 18.34 18.61C18.03 18.93 17.73 19.13 17.31 19.3C16.99 19.43 16.52 19.57 15.64 19.62C14.69 19.66 14.41 19.67 12 19.67C9.59001 19.67 9.31001 19.67 8.36001 19.62C7.48001 19.58 7.01001 19.43 6.69001 19.3C6.27001 19.13 5.97001 18.94 5.66001 18.61C5.35001 18.29 5.15001 17.98 4.99001 17.56C4.87001 17.24 4.72001 16.75 4.68001 15.86C4.64001 14.89 4.63001 14.6 4.63001 12.16C4.63001 9.72 4.63001 9.42 4.68001 8.46C4.72001 7.57 4.87001 7.08 4.99001 6.76C5.15001 6.33 5.35001 6.03 5.66001 5.71C5.97001 5.39 6.27001 5.19 6.69001 5.02C7.01001 4.89 7.48001 4.75 8.36001 4.7C9.31001 4.66 9.59001 4.65 12 4.65ZM12 3C9.56001 3 9.25001 3.01 8.29001 3.06C7.33001 3.1 6.68001 3.26 6.11001 3.49C5.52001 3.72 5.02001 4.04 4.52001 4.55C4.02001 5.06 3.71001 5.57 3.48001 6.17C3.26001 6.75 3.11001 7.42 3.06001 8.4C3.02001 9.38 3.01001 9.69 3.01001 12.18C3.01001 14.67 3.02001 14.98 3.06001 15.96C3.10001 16.94 3.26001 17.6 3.48001 18.19C3.71001 18.79 4.02001 19.3 4.52001 19.81C5.02001 20.32 5.52001 20.63 6.11001 20.87C6.68001 21.1 7.34001 21.25 8.29001 21.3C9.25001 21.34 9.56001 21.36 12 21.36C14.44 21.36 14.75 21.35 15.71 21.3C16.67 21.26 17.32 21.1 17.89 20.87C18.48 20.64 18.98 20.32 19.48 19.81C19.98 19.3 20.29 18.79 20.52 18.19C20.74 17.61 20.89 16.94 20.94 15.96C20.98 14.98 20.99 14.67 20.99 12.18C20.99 9.69 20.98 9.38 20.94 8.4C20.9 7.42 20.74 6.76 20.52 6.17C20.29 5.57 19.98 5.06 19.48 4.55C18.98 4.04 18.48 3.73 17.89 3.49C17.32 3.26 16.66 3.11 15.71 3.06C14.75 3.02 14.44 3 12 3Z"></path>
                        <path
                            d="M12 7.45996C9.45 7.45996 7.38 9.56996 7.38 12.17C7.38 14.77 9.45 16.88 12 16.88C14.55 16.88 16.62 14.77 16.62 12.17C16.62 9.56996 14.55 7.45996 12 7.45996ZM12 15.22C10.34 15.22 9 13.85 9 12.16C9 10.47 10.34 9.09996 12 9.09996C13.66 9.09996 15 10.47 15 12.16C15 13.85 13.66 15.22 12 15.22Z"></path>
                        <path
                            d="M16.8 8.36992C17.3964 8.36992 17.88 7.87743 17.88 7.26992C17.88 6.66241 17.3964 6.16992 16.8 6.16992C16.2035 6.16992 15.72 6.66241 15.72 7.26992C15.72 7.87743 16.2035 8.36992 16.8 8.36992Z"></path>
                    </svg>
                    Instagram
                </a>
            </div>
        </footer>
    )
        ;
}