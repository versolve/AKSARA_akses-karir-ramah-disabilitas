import type { SVGAttributes } from 'react';

export default function AppLogoIcon({
    className = 'size-8',
    ...props
}: { className?: string } & SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Circular blue badge */}
            <circle cx="24" cy="24" r="24" fill="#1D64EC" />
            {/* Bold white letter P matching the Profabel brandmark */}
            <path
                d="M18 13H27.5C31.6421 13 35 16.3579 35 20.5C35 24.6421 31.6421 28 27.5 28H23V35H18V13ZM23 23.5H27C28.6569 23.5 30 22.1569 30 20.5C30 18.8431 28.6569 17.5 27 17.5H23V23.5Z"
                fill="white"
            />
        </svg>
    );
}
