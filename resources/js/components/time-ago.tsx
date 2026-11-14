import { formatTimeAgo } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface TimeAgoProps {
    date?: string | Date | null;
    fallback?: string;
    className?: string;
    showTooltip?: boolean;
}

/**
 * Komponen TimeAgo untuk merender waktu relatif secara real-time.
 * Memperbarui tampilan secara otomatis setiap 30 detik tanpa perlu refresh halaman.
 */
export function TimeAgo({
    date,
    fallback,
    className,
    showTooltip = true,
}: TimeAgoProps) {
    const [timeText, setTimeText] = useState<string>(() => {
        if (!date && fallback) return fallback;
        return formatTimeAgo(date);
    });

    useEffect(() => {
        const updateText = () => {
            if (!date) {
                if (fallback) setTimeText(fallback);
                return;
            }
            setTimeText(formatTimeAgo(date));
        };

        updateText();

        // Interval perbaruan otomatis tiap 30 detik (real-time)
        const timer = setInterval(updateText, 30000);

        return () => clearInterval(timer);
    }, [date, fallback]);

    let fullTitle: string | undefined;
    if (showTooltip && date) {
        try {
            const d = typeof date === 'string' ? new Date(date) : date;
            if (!isNaN(d.getTime())) {
                fullTitle = d.toLocaleString('id-ID', {
                    dateStyle: 'full',
                    timeStyle: 'medium',
                });
            }
        } catch {
            // ignore
        }
    }

    return (
        <span className={className} title={fullTitle}>
            {timeText}
        </span>
    );
}

export default TimeAgo;

