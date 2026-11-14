import type { InertiaLinkProps } from '@inertiajs/react';
import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

/**
 * Format timestamp / string tanggal ISO menjadi waktu relatif Bahasa Indonesia secara real-time.
 * Contoh: "Baru saja", "5 menit yang lalu", "2 jam yang lalu", "1 hari yang lalu", dst.
 */
export function formatTimeAgo(dateInput?: string | Date | null): string {
    if (!dateInput) return 'Baru saja';

    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return 'Baru saja';

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    // Antisipasi selisih waktu clock skew atau < 45 detik
    if (diffInSeconds < 45) {
        return 'Baru saja';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
        return `${diffInMinutes} menit yang lalu`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        return `${diffInHours} jam yang lalu`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
        return `${diffInDays} hari yang lalu`;
    }

    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
        return `${diffInWeeks} minggu yang lalu`;
    }

    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
        return `${diffInMonths} bulan yang lalu`;
    }

    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears} tahun yang lalu`;
}

