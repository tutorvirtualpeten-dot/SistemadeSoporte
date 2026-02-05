'use client';

import { useState, useEffect } from 'react';

interface LogoImageProps {
    src?: string;
    alt?: string;
    className?: string;
    fallbackSrc?: string;
}

export default function LogoImage({
    src,
    alt = "Logo",
    className,
    fallbackSrc = "/logo_mineduc.jpg"
}: LogoImageProps) {
    const [hasError, setHasError] = useState(false);

    // Reset error state when src changes
    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (hasError) {
        // If the primary src failed, we can try the fallback.
        // If fallback was the one that failed, or if we want to just hide it:
        if (src !== fallbackSrc) {
            return (
                <img
                    src={fallbackSrc}
                    alt={alt}
                    className={className}
                    onError={() => setHasError(true)} // Prevent infinite if fallback also fails
                />
            );
        }
        return null; // Both failed, render nothing
    }

    // Attempt to render the provided src, or default to fallback if src is empty
    const imageSource = src || fallbackSrc;

    return (
        <img
            src={imageSource}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
        />
    );
}
