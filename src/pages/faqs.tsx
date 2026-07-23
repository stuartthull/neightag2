import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const faqs = [
    {
        question: 'What is NeighTag?',
        answer: (
            <p>
                NeighTag is a digital stable management service that helps you keep your horse's
                important information in one place. You can manage records, reminders and emergency
                details, then share selected information using a QR code.
            </p>
        ),
    },
    {
        question: 'Is it free to create an account and add my horse?',
        answer: (
            <p>
                Yes. Creating an account and storing your horse's details is free. Paid features,
                including the shareable QR code, calendar and horsebox tools, are not available if
                you do not have a subscription.
            </p>
        ),
    },
    {
        question: 'How does the NeighTag QR code work?',
        answer: (
            <p>
                Your horse gets a unique QR code. When somebody scans it, they can view the
                information you have chosen to make public, such as emergency contacts, medical
                notes or stable details.
            </p>
        ),
    },
    {
        question: 'What is the TapTag and how can i get one?',
        answer: (
            <p>
                The TapTag is a small NFC tag that you can attach to your horse's saddle or on
                yourself. It contains your horse's unique code, so people can scan it to view your
                horse's public profile. Visit the <a href={'/shop'}>shop page</a> to get one.
            </p>
        ),
    },
    {
        question: 'What is the Tap Stable Card and how can i get one?',
        answer: (
            <p>
                The Tap Stable Card is a small NFC tag that you can attach to your horse's stable
                door. It contains your horse's unique code, so people can scan it to view your
                horse's public profile. They will be available shortly.
            </p>
        ),
    },
    {
        question: 'Can I control which details people can see?',
        answer: (
            <p>
                Yes. Privacy controls let you choose which fields appear on your horse's public
                profile. Your private account information is not displayed on the public page.
            </p>
        ),
    },
    {
        question: "Can I update my horse's information after creating a profile?",
        answer: (
            <p>
                Yes. Sign in to Your Stable whenever you need to update contact details, medical
                information, reminders or other records. The updated public information is available
                through the same QR code.
            </p>
        ),
    },
    {
        question: 'How can I end my subscription?',
        answer: (
            <p>
                On your dashboard, you can cancel your subscription at any time. Your horse's
                information will remain in your account, but subscription-only features will no
                longer be available. Click the link and you will see your NeighTag subscription
                details. Click into the subscription on Stripe and cancel from there.
            </p>
        ),
    },
    {
        question: 'What happens if my subscription ends?',
        answer: (
            <p>
                We keep your horse's stored details so they are ready if you subscribe again.
                Subscription-only features will no longer be available while the subscription is
                inactive.
            </p>
        ),
    },
    {
        question: 'Do I need to install an app?',
        answer: (
            <p>
                No. NeighTag works in a web browser on phones, tablets and computers, so there is no
                app to download.
            </p>
        ),
    },
    {
        question: 'How can I get help?',
        answer: (
            <p>
                If you cannot find the answer here, visit our{' '}
                <Link to="/contact-us">contact page</Link> or email{' '}
                <a href="mailto:info@neightag.com">info@neightag.com</a>.
            </p>
        ),
    },
];

export default function Faqs(): React.JSX.Element {
    return (
        <main className="page-wrapper">
            <Helmet>
                <title>Frequently Asked Questions | NeighTag</title>
                <meta
                    name="description"
                    content="Find answers to common questions about NeighTag accounts, QR codes, privacy, subscriptions and managing your horse's information."
                />
                <meta property="og:title" content="Frequently Asked Questions | NeighTag" />
            </Helmet>

            <div className="page-container">
                <section className="section-container white-section-container">
                    <div className="faq-heading">
                        <p className="faq-eyebrow">Help centre</p>
                        <h1 className="textbig">Frequently Asked Questions</h1>
                        <p className="text-normal">
                            Everything you need to know about setting up and using NeighTag.
                        </p>
                    </div>

                    <div className="faq-accordion">
                        {faqs.map((faq, index) => (
                            <details className="faq-item" key={faq.question} open={index === 0}>
                                <summary className="faq-question">
                                    <span>{faq.question}</span>
                                    <span className="faq-icon" aria-hidden="true" />
                                </summary>
                                <div className="faq-answer text-normal">{faq.answer}</div>
                            </details>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
