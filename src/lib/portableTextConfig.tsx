import React, { createContext, useContext } from 'react';
import { cn } from '@/lib/utils';

/**
 * Context to track if we're already inside a link, preventing nested <a> tags
 */
export const LinkContext = createContext(false);

/**
 * Shared PortableText components configuration
 * Handles links with nested link prevention and catches all unknown marks
 */
export const getPortableTextComponents = (options: {
    themeColors?: {
        link?: string;
        strong?: string;
        heading?: string;
    };
} = {}) => {
    const themeColors = options.themeColors || {
        link: 'text-brand-green hover:text-brand-green-dark',
        strong: 'text-gray-900',
        heading: 'text-gray-900',
    };

    return {
        marks: {
            // Handle links with nested link prevention
            link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => {
                const href = value?.href || '#';
                const isInsideLink = useContext(LinkContext);

                // If already inside a link, render as span to prevent nested <a> tags
                if (isInsideLink) {
                    return <span className={cn('underline', themeColors.link)}>{children}</span>;
                }

                let isExternal = false;
                try {
                    if (href.startsWith('http')) {
                        const u = new URL(href);
                        // Treat our own host as internal even if absolute
                        isExternal = !u.hostname.endsWith('dinelportal.dk');
                    }
                } catch {
                    isExternal = false;
                }

                return (
                    <LinkContext.Provider value={true}>
                        <a
                            href={href}
                            className={cn('underline transition-colors duration-200', themeColors.link)}
                            target={isExternal ? '_blank' : undefined}
                            rel={isExternal ? 'noopener noreferrer' : undefined}
                        >
                            {children}
                        </a>
                    </LinkContext.Provider>
                );
            },

            // Handle strong/bold
            strong: ({ children }: { children?: React.ReactNode }) => (
                <strong className={cn('font-semibold', themeColors.strong)}>{children}</strong>
            ),

            // Handle emphasis/italic
            em: ({ children }: { children?: React.ReactNode }) => <em className="italic">{children}</em>,

            // Handle code
            code: ({ children }: { children?: React.ReactNode }) => (
                <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
                    {children}
                </code>
            ),
        },

        // Catch-all for unknown marks - render as span to prevent default behavior
        unknownMark: ({ children }: { children?: React.ReactNode }) => {
            // Simply return children wrapped in a span to prevent nested links
            return <span>{children}</span>;
        },
    };
};

