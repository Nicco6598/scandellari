import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { logger } from '../../utils/logger';

// Google Analytics 4 Measurement ID
// Replace with your actual GA4 Measurement ID (format: G-XXXXXXXXXX)
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

// Initialize Google Analytics
export const initGA = () => {
    if (!GA_MEASUREMENT_ID) {
        logger.warn('Google Analytics Measurement ID not found. Analytics will not be tracked.');
        return;
    }

    // Load gtag.js script after critical render
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
        window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
        send_page_view: false // We'll send page views manually
    });

    // Make gtag available globally
    (window as any).gtag = gtag;
};

// Track page view
export const trackPageView = (path: string, title?: string) => {
    if (!GA_MEASUREMENT_ID || typeof (window as any).gtag !== 'function') return;

    (window as any).gtag('event', 'page_view', {
        page_path: path,
        page_title: title || document.title
    });
};

// Track custom events
export const trackEvent = (
    eventName: string,
    eventParams?: {
        category?: string;
        label?: string;
        value?: number;
        [key: string]: any;
    }
) => {
    if (!GA_MEASUREMENT_ID || typeof (window as any).gtag !== 'function') return;

    (window as any).gtag('event', eventName, eventParams);
};

// Common event trackers
export const trackFormSubmit = (formName: string, success: boolean = true) => {
    trackEvent('form_submit', {
        category: 'engagement',
        label: formName,
        value: success ? 1 : 0,
        success
    });
};

export const trackDownload = (fileName: string, fileType: string) => {
    trackEvent('file_download', {
        category: 'engagement',
        label: fileName,
        file_type: fileType
    });
};

export const trackOutboundLink = (url: string, label?: string) => {
    trackEvent('click', {
        category: 'outbound',
        label: label || url,
        value: 1
    });
};

export const trackSearch = (searchTerm: string, resultsCount?: number) => {
    trackEvent('search', {
        search_term: searchTerm,
        results_count: resultsCount
    });
};

export const trackProjectView = (projectId: string, projectTitle: string) => {
    trackEvent('view_item', {
        category: 'projects',
        label: projectTitle,
        item_id: projectId,
        item_name: projectTitle
    });
};

export const trackCertificationView = (certificationTitle: string) => {
    trackEvent('view_item', {
        category: 'certifications',
        label: certificationTitle,
        item_name: certificationTitle
    });
};

// React component to track page views automatically
const Analytics: React.FC = () => {
    const location = useLocation();

    useEffect(() => {
        // Initialize GA on mount
        initGA();
    }, []);

    useEffect(() => {
        // Track page view on route change
        trackPageView(location.pathname + location.search);
    }, [location]);

    return null;
};

export default Analytics;

// TypeScript declarations
declare global {
    interface Window {
        dataLayer: any[];
        gtag?: (...args: any[]) => void;
    }
}
