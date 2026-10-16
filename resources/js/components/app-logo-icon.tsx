import type { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <linearGradient id="aksara-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#0D9488" />
                </linearGradient>
            </defs>
            {/* Minimalist A shape forming bridge/accessibility path */}
            <path
                fill="url(#aksara-gradient)"
                d="M32 4L12 20v24l20 16 20-16V20L32 4zm0 7.5L46.5 21v18L32 51.5 17.5 39V21L32 11.5z"
            />
            {/* Access ramp symbol */}
            <path
                fill="none"
                stroke="#0D9488"
                strokeWidth="3"
                d="M18 32h28l-3 7H21z"
            />
            {/* Accessibility focus point */}
            <circle cx="32" cy="30" r="2.5" fill="#0D9488" />
        </svg>
    );
}
