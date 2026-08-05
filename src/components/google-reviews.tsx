import React from 'react';

// Place ID extracted from your Google Maps link
const PLACE_ID = 'ChIJE2KYKAIBe0gR33Up7922hKs';
const DIRECT_REVIEW_URL = `https://search.google.com/local/writereview?placeid=${PLACE_ID}`;

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    text: string;
}

// Copy and paste your top reviews here manually
const REVIEWS_DATA: Review[] = [];

export const StaticGoogleReviews: React.FC = () => {
    return (
        <section style={styles.container}>
            <header style={styles.header}>
                <h3 className="textmedium">What Our Customers Say</h3>
                <div style={styles.summary}>
                    <span style={styles.score}>0</span>
                    <span style={styles.stars}>★★★★★</span>
                    <span style={styles.badge}>Google Reviews</span>
                </div>
                <a
                    href={DIRECT_REVIEW_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.reviewBtn}
                >
                    Leave a Review on Google
                </a>
            </header>

            <div style={styles.grid}>
                {REVIEWS_DATA.map((review) => (
                    <div key={review.id} style={styles.card}>
                        <div style={styles.cardHeader}>
                            <strong>{review.author}</strong>
                            <span style={styles.date}>{review.date}</span>
                        </div>
                        <div style={styles.stars}>
                            {'★'.repeat(review.rating)}
                            {'☆'.repeat(5 - review.rating)}
                        </div>
                        <p style={styles.text}>"{review.text}"</p>
                    </div>
                ))}
            </div>
        </section>
    );
};

const styles: Record<string, React.CSSProperties> = {
    header: { textAlign: 'center', marginBottom: '24px' },
    summary: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '8px',
        margin: '8px 0',
    },
    score: { fontSize: '20px', fontWeight: 'bold' },
    stars: { color: '#f4c430', fontSize: '18px' },
    badge: { color: '#666', fontSize: '14px' },
    reviewBtn: {
        display: 'inline-block',
        marginTop: '10px',
        padding: '8px 16px',
        backgroundColor: '#4285F4',
        color: '#fff',
        textDecoration: 'none',
        borderRadius: '4px',
        fontWeight: 'bold',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px',
    },
    card: {
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '16px',
        backgroundColor: '#fff',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '14px',
        marginBottom: '6px',
    },
    date: { color: '#888', fontSize: '12px' },
    text: { fontSize: '14px', color: '#333', marginTop: '8px', fontStyle: 'italic' },
};
