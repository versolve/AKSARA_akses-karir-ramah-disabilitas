export default function Heading({
    title,
    description,
    variant = 'default',
}: {
    title: string;
    description?: string;
    variant?: 'default' | 'small';
}) {
    return (
        <header className={variant === 'small' ? '' : 'mb-8 space-y-0.5'}>
            <h2
                className={
                    variant === 'small'
                        ? 'mb-0.5 text-base font-bold text-[#102B4B]'
                        : 'text-xl font-extrabold tracking-tight text-[#102B4B]'
                }
            >
                {title}
            </h2>
            {description && (
                <p className="text-xs text-[#64748B] sm:text-sm">{description}</p>
            )}
        </header>
    );
}
