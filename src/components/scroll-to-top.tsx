import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop(): null {
    // 🔍 Listen to changes in the URL path
    const { pathname } = useLocation();

    useEffect(() => {
        // 🚀 Force the window to snap back to coordinates (0, 0)
        window.scrollTo(0, 0);
    }, [pathname]); // Fires instantly every single time the path changes

    return null; // This component doesn't render any visible elements
}