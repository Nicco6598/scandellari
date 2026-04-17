import React from 'react';
import { Helmet } from 'react-helmet-async';

const CANONICAL_SITE_URL = 'https://scandellarigiacintosnc.it';

function toAbsoluteUrl(value: string) {
    if (value.startsWith('http')) return value;
    return `${CANONICAL_SITE_URL}${value.startsWith('/') ? value : `/${value}`}`;
}

interface SEOProps {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article';
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
}

const SEO: React.FC<SEOProps> = ({
    title = 'Scandellari Giacinto s.n.c. - Segnalamento e Sicurezza Ferroviaria dal 1945',
    description = 'Leader nell\'installazione di sistemi di segnalamento e sicurezza ferroviaria in Italia. Oltre 75 anni di esperienza al servizio dell\'infrastruttura ferroviaria nazionale.',
    keywords = 'segnalamento ferroviario, sicurezza ferroviaria, impianti ferroviari, RFI, Trenitalia, SCMT, ACEI, alta velocità, manutenzione ferroviaria, Scandellari',
    image = '/og-image.webp',
    url = '/',
    type = 'website',
    author = 'Scandellari Giacinto s.n.c.',
    publishedTime,
    modifiedTime
}) => {
    const fullUrl = toAbsoluteUrl(url);
    const fullImage = toAbsoluteUrl(image);

    return (
        <Helmet>
            {/* Primary Meta Tags */}
            <title>{title}</title>
            <meta name="title" content={title} />
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords} />
            <meta name="author" content={author} />
            <link rel="canonical" href={fullUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={fullUrl} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:site_name" content="Scandellari Giacinto s.n.c." />
            <meta property="og:locale" content="it_IT" />

            {/* Article specific tags */}
            {type === 'article' && publishedTime && (
                <meta property="article:published_time" content={publishedTime} />
            )}
            {type === 'article' && modifiedTime && (
                <meta property="article:modified_time" content={modifiedTime} />
            )}
            {type === 'article' && (
                <meta property="article:author" content={author} />
            )}

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={fullUrl} />
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:image" content={fullImage} />

            {/* Additional SEO tags */}
            <meta name="robots" content="index, follow" />
            <meta name="language" content="Italian" />
            <meta name="revisit-after" content="7 days" />
            <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
    );
};

export default SEO;
