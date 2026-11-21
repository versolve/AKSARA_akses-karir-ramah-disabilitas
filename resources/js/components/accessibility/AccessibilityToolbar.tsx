import { Button } from '@/components/ui/button';
import { TextScaleSelector } from './TextScaleSelector';
import { Contrast, Settings, Volume2, X, Sun, Moon } from 'lucide-react';
import { useEffect, useState, useCallback, type ReactElement } from 'react';
import { useAppearance } from '@/hooks/use-appearance';

type ScaleValue = 80 | 90 | 100 | 110 | 125;

export function AccessibilityToolbar(): ReactElement {
    const { resolvedAppearance, updateAppearance } = useAppearance();

    const [textScale, setTextScale] = useState<number>(() => {
        if (typeof window === 'undefined') return 100;
        const stored = localStorage.getItem('profabel-text-scale');
        return stored ? Number.parseInt(stored, 10) : 100;
    });

    const [highContrast, setHighContrast] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('profabel-high-contrast') === 'true';
    });

    const [showSettings, setShowSettings] = useState<boolean>(false);
    const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return localStorage.getItem('profabel-tts-enabled') === 'true';
    });

    const applyFontScale = useCallback((scale: number): void => {
        document.documentElement.style.setProperty(
            '--font-scale',
            `${scale / 100}`,
        );
        localStorage.setItem('profabel-text-scale', String(scale));
        setTextScale(scale);
    }, []);

    const toggleHighContrast = useCallback(() => {
        const newValue = !highContrast;
        if (newValue) {
            document.body.classList.add('high-contrast');
            document.body.setAttribute('data-contrast-theme', resolvedAppearance);
        } else {
            document.body.classList.remove('high-contrast');
            document.body.removeAttribute('data-contrast-theme');
        }
        localStorage.setItem('profabel-high-contrast', String(newValue));
        setHighContrast(newValue);
    }, [highContrast, resolvedAppearance]);

    const toggleTts = useCallback(() => {
        const newValue = !ttsEnabled;
        localStorage.setItem('profabel-tts-enabled', String(newValue));
        setTtsEnabled(newValue);

        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            if (newValue) {
                // Speak page title and notification when turned on
                window.speechSynthesis.cancel();
                const mainText =
                    document.querySelector('h1')?.textContent ||
                    document.title ||
                    'Fitur Text-to-Speech aktif';
                const utterance = new SpeechSynthesisUtterance(
                    `Text-to-Speech aktif. Halaman: ${mainText}`,
                );
                utterance.lang = 'id-ID';
                window.speechSynthesis.speak(utterance);
            } else {
                window.speechSynthesis.cancel();
            }
        }
    }, [ttsEnabled]);

    useEffect(() => {
        applyFontScale(textScale);
    }, [textScale, applyFontScale]);

    useEffect(() => {
        if (highContrast) {
            document.body.classList.add('high-contrast');
            document.body.setAttribute('data-contrast-theme', resolvedAppearance);
        } else {
            document.body.classList.remove('high-contrast');
            document.body.removeAttribute('data-contrast-theme');
        }
    }, [highContrast, resolvedAppearance]);

    return (
        <div className="fixed right-6 bottom-6 z-50">
            {!showSettings ? (
                <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    aria-label="Buka preferensi aksesibilitas"
                    className="flex items-center justify-center rounded-full bg-[#123B5D] text-white shadow-lg ring-2 ring-white transition hover:bg-[#0C2742] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1] active:scale-95"
                    style={{ width: '56px', height: '56px' }}
                >
                    <Settings className="h-6 w-6" aria-hidden="true" />
                </button>
            ) : (
                <div
                    role="dialog"
                    aria-label="Preferensi aksesibilitas"
                    className="w-[calc(100vw-3rem)] max-w-xs rounded-2xl border border-[#D0E5F0] bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-[#07132B] dark:text-white"
                >
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                            Aksesibilitas
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowSettings(false)}
                            aria-label="Tutup preferensi"
                            className="flex items-center justify-center rounded-full hover:bg-[#EBF5FA] dark:hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#20B8C1]"
                            style={{ minWidth: '44px', minHeight: '44px' }}
                        >
                            <X className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>

                    <div className="mb-4">
                        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Mode Tampilan
                        </span>
                        <div className="grid grid-cols-2 gap-2">
                            <Button
                                type="button"
                                variant={resolvedAppearance === 'light' ? 'default' : 'outline'}
                                onClick={() => updateAppearance('light')}
                                aria-pressed={resolvedAppearance === 'light'}
                                className="w-full justify-center"
                                style={{ minHeight: '38px' }}
                            >
                                <Sun className="mr-1.5 h-4 w-4 text-amber-500" />
                                Terang
                            </Button>
                            <Button
                                type="button"
                                variant={resolvedAppearance === 'dark' ? 'default' : 'outline'}
                                onClick={() => updateAppearance('dark')}
                                aria-pressed={resolvedAppearance === 'dark'}
                                className="w-full justify-center"
                                style={{ minHeight: '38px' }}
                            >
                                <Moon className="mr-1.5 h-4 w-4 text-indigo-400" />
                                Gelap
                            </Button>
                        </div>
                    </div>

                    <div className="mb-5">
                        <span
                            className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
                            id="text-scale-label"
                        >
                            Ukuran Teks
                        </span>
                        <TextScaleSelector
                            currentScale={textScale as ScaleValue}
                            onUpdate={(scale) => applyFontScale(scale)}
                        />
                    </div>

                    <div className="mb-4">
                        <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                            Text-to-Speech
                        </span>
                        <Button
                            type="button"
                            variant={ttsEnabled ? 'default' : 'outline'}
                            onClick={toggleTts}
                            aria-pressed={ttsEnabled}
                            style={{ minHeight: '44px' }}
                        >
                            <Volume2
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                            />
                            {ttsEnabled ? 'Nonaktifkan TTS' : 'Aktifkan TTS'}
                        </Button>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                Kontras Tinggi
                            </span>
                            {highContrast && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-800 dark:bg-blue-900/60 dark:text-blue-300">
                                    {resolvedAppearance === 'dark' ? (
                                        <>
                                            <Moon className="h-3 w-3" /> Mode Gelap
                                        </>
                                    ) : (
                                        <>
                                            <Sun className="h-3 w-3" /> Mode Terang
                                        </>
                                    )}
                                </span>
                            )}
                        </div>
                        <Button
                            type="button"
                            variant={highContrast ? 'default' : 'outline'}
                            onClick={toggleHighContrast}
                            aria-pressed={highContrast}
                            style={{ minHeight: '44px' }}
                            className="w-full justify-center font-medium"
                        >
                            <Contrast
                                className="mr-2 h-4 w-4"
                                aria-hidden="true"
                            />
                            {highContrast ? 'On' : 'Off'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
