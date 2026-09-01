import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import '../css/blog.css';
import emergencyHorseInformation from '../data/blog/emergency-horse-information.json';
import stableRoutine from '../data/blog/stable-routine.json';
import horseboxChecklist from '../data/blog/horsebox-checklist.json';
import lifetimeOfProtection from '../data/blog/lifetime-of-protection-needs-ongoing-care.json';
import horseSafetyImage from '../assets/blog/horsesafety.jpg';
import healthImage from '../assets/blog/health.jpg';
import horseboxChecklistImage from '../assets/blog/transport.jpg';
import whynotfreeImage from '../assets/blog/whynotfree.jpg';

type BlogArticle = {
    slug: string;
    category: string;
    title: string;
    image: string;
    imageAlt: string;
    summary: string;
    metaDescription: string;
    targetKeywords: string[];
    intro: string;
    sections: { heading: string; paragraphs: string[]; list?: string[]; tip?: string }[];
};

const articles: BlogArticle[] = [
    emergencyHorseInformation,
    stableRoutine,
    horseboxChecklist,
    lifetimeOfProtection,
];

function getBlogImage(image: string): string {
    if (image === '/images/blog/horsesafety.jpg') {
        return horseSafetyImage;
    }

    if (image === '/images/health.jpg') {
        return healthImage;
    }

    if (image === '/images/transport.jpg') {
        return horseboxChecklistImage;
    }

    if (image === '/images/whynotfree.jpg') {
        return whynotfreeImage;
    }

    return image;
}

function BlogArticlePage({ article }: { article: BlogArticle }): React.JSX.Element {
    return (
        <main className="page-wrapper blog-page">
            <Helmet>
                <title>{article.title} | NeighTag</title>
                <meta name="description" content={article.metaDescription} />
            </Helmet>
            <div className="page-container">
                <article className="blog-article">
                    <img src={getBlogImage(article.image)} alt={article.imageAlt} className="blog-article-image" />
                    <p className="blog-eyebrow">{article.category}</p>
                    <h1 className="textbig">{article.title}</h1>
                    <p className="text-normal marginbsixteen">{article.summary}</p>
                    {article.intro && <p className="text-normal">{article.intro}</p>}
                    {article.sections.map((section) => (
                        <section key={section.heading}>
                            <h2>{section.heading}</h2>
                            {section.paragraphs.map((paragraph) => (
                                <p className="text-normal" key={paragraph}>{paragraph}</p>
                            ))}
                            {section.list && (
                                <ul className="blog-list">
                                    {section.list.map((item) => <li key={item}>{item}</li>)}
                                </ul>
                            )}
                            {section.tip && <aside className="blog-tip"><strong>Tip:</strong> {section.tip}</aside>}
                        </section>
                    ))}
                    <Link to="/blog" className="blog-back-link">Back to the blog</Link>
                </article>
            </div>
        </main>
    );
}

function BlogNotFound(): React.JSX.Element {
    return (
        <main className="page-wrapper blog-page">
            <Helmet><title>Blog post not found | NeighTag</title></Helmet>
            <div className="page-container">
                <article className="blog-article">
                    <h1 className="textbig">Blog post not found</h1>
                    <p className="text-normal">That article is not available.</p>
                    <Link to="/blog" className="blog-back-link">Back to the blog</Link>
                </article>
            </div>
        </main>
    );
}

export default function Blog(): React.JSX.Element {
    const { slug } = useParams();
    const article = articles.find((item) => item.slug === slug);

    if (slug) {
        return article ? <BlogArticlePage article={article} /> : <BlogNotFound />;
    }

    return (
        <main className="page-wrapper blog-page">
            <Helmet>
                <title>Blog | NeighTag</title>
                <meta name="description" content="Helpful ideas for horse owners, stable life and safer days out with your horse." />
            </Helmet>
            <div className="page-container">
                <section className="blog-intro">
                    <p className="blog-eyebrow">From the NeighTag team</p>
                    <h1 className="textbig">The NeighTag blog</h1>
                    <p className="text-normal">
                        Small, practical notes for organising horse care and making life at the yard a little simpler.
                    </p>
                </section>
                <section className="blog-grid" aria-label="Blog posts">
                    {articles.map((article) => (
                        <article className="blog-card" key={article.slug}>
                            <img src={getBlogImage(article.image)} alt={article.imageAlt} className="blog-card-image" />
                            <p className="blog-card-category">{article.category}</p>
                            <h2>{article.title}</h2>
                            <p className="text-normal">{article.summary}</p>
                            <Link to={`/blog/${article.slug}`} className="blog-card-link">Read article</Link>
                        </article>
                    ))}
                </section>
            </div>
        </main>
    );
}