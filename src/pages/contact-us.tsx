import React from 'react';
import { Helmet } from 'react-helmet-async';


export default function ContactUs(): React.JSX.Element {
    return (
        <main className="page-wrapper">
            <Helmet>
                <title>About Us | Contact NeighTag</title>
                <meta name="description" content="Contact the horse-loving family behind NeighTag." />
                <meta property="og:title" content="About Us | Contact NeighTag" />
            </Helmet>
            <div className="page-container">

                {/* HERO SECTION */}
                <section className="section-container white-section-container">
                    <h1 className="textbig">Contact Us</h1>
                    <h2 className="textmedium">
                        Welcome to NeighTag! 🐴
                    </h2>
                    <p className="text-normal" style={{ marginTop: '16px', lineHeight: '1.6' }}>
                        If you wish to get in touch, email us on <a href="mailto:info@neightag.com">info@neightag.com</a>.
                    </p>
                </section>
            </div>
        </main>
    );
}