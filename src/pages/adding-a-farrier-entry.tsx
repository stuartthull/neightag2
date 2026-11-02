import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import FarrierAppFeeds from '../assets/farrier-app-feeds.jpg';

export default function AddingAFarrierEntry(): React.JSX.Element {
    return (
        <main className="page-wrapper">
            <Helmet>
                <title>Adding a Farrier Entry | NeighTag</title>
                <meta
                    name="description"
                    content="Add farrier appointments to your NeighTag calendar and keep your horse's care schedule organised."
                />
                <meta property="og:title" content="Adding a Farrier Entry | NeighTag" />
                <meta
                    property="og:description"
                    content="Add farrier appointments to your NeighTag calendar and keep your horse's care schedule organised."
                />
            </Helmet>

            <div className="page-container">
                <section className="section-container white-section-container">
                    <h1 className="textbig marginbsixteen">Adding a farrier entry</h1>
                    <div className="about-split-row">
                        <div className="about-text-col">
                            <p className="text-normal marginbsixteen">
                                Keep your horse's farrier appointments in the same calendar as
                                everything else you need to remember at the yard.
                            </p>
                            <p className="text-normal marginbsixteen">
                                Not there when your farrier comes? They can now add the appointment date, time and notes, then you use your calendar to
                                keep track of upcoming visits and your horse's care routine.
                            </p>
                            <ol>
                                <li className="text-normal marginbeight">
                                    Ask your farrier to scan the QR code..
                                </li>
                                <li className="text-normal marginbeight">
                                    They can add an entry with date and time.
                                </li>
                                <li className="text-normal marginbeight">
                                    You get notified on NeighTag and choose to accept or not.
                                </li>
                                <li className="text-normal marginbeight">
                                    If you accept it then it goes into your NeighTag calendar.
                                </li>
                            </ol>
                            <Link to="/calendar" className="buttonMain buttonOrange">
                                Open your calendar
                            </Link>
                        </div>
                        <img
                            src={FarrierAppFeeds}
                            alt="Farrier appointment and horse care information"
                            className="jane-image"
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}
