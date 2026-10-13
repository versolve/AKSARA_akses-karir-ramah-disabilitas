import { Button } from '@/components/ui/button';
import { TextScaleSelector } from './TextScaleSelector';
import { Contrast, Settings, Volume2, X } from 'lucide-react';
import { useEffect, useState, useCallback, type ReactElement } from 'react';

type ScaleValue = 80 | 90 | 100 | 110 | 125;

export function AccessibilityToolbar(): ReactElement {
  const [textScale, setTextScale] = useState<number>(() => {
    if (typeof window === 'undefined') return 100;
    const stored = localStorage.getItem('aksara-text-scale');
    return stored ? Number.parseInt(stored, 10) : 100;
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aksara-high-contrast') === 'true';
  });

  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('aksara-tts-enabled') === 'true';
  });

  const applyFontScale = useCallback((scale: number): void => {
    document.documentElement.style.setProperty('--font-scale', `${scale / 100}`);
    localStorage.setItem('aksara-text-scale', String(scale));
    setTextScale(scale);
  }, []);

  const toggleHighContrast = useCallback(() => {
    const newValue = !highContrast;
    document.body.classList.toggle('high-contrast', newValue);
    localStorage.setItem('aksara-high-contrast', String(newValue));
    setHighContrast(newValue);
  }, [highContrast]);

  const toggleTts = useCallback(() => {
    const newValue = !ttsEnabled;
    localStorage.setItem('aksara-tts-enabled', String(newValue));
    setTtsEnabled(newValue);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (newValue) {
        // Speak page title and notification when turned on
        window.speechSynthesis.cancel();
        const mainText = document.querySelector('h1')?.textContent || document.title || 'Fitur Text-to-Speech aktif';
        const utterance = new SpeechSynthesisUtterance(`Text-to-Speech aktif. Halaman: ${mainText}`);
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
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!showSettings ? (
        <button
          type="button"
          onClick={() => setShowSettings(true)}
          aria-label="Buka preferensi aksesibilitas"
          className="flex items-center justify-center rounded-full bg-teal-600 text-white shadow-lg transition hover:bg-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          style={{ width: '56px', height: '56px' }}
        >
          <Settings className="h-6 w-6" aria-hidden="true" />
        </button>
      ) : (
        <div
          role="dialog"
          aria-label="Preferensi aksesibilitas"
          className="w-[calc(100vw-3rem)] max-w-xs rounded-2xl border border-slate-200 bg-white p-6 shadow-xl"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-800">Aksesibilitas</h3>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              aria-label="Tutup preferensi"
              className="flex items-center justify-center rounded-full hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500"
              style={{ minWidth: '44px', minHeight: '44px' }}
            >
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>

          <div className="mb-6">
            <span className="mb-2 block text-sm font-medium text-slate-700" id="text-scale-label">
              Ukuran Teks
            </span>
            <TextScaleSelector
              currentScale={textScale as ScaleValue}
              onUpdate={(scale) => applyFontScale(scale)}
            />
          </div>

          <div className="mb-4">
            <span className="mb-2 block text-sm font-medium text-slate-700">Text-to-Speech</span>
            <Button
              type="button"
              variant={ttsEnabled ? 'default' : 'outline'}
              onClick={toggleTts}
              aria-pressed={ttsEnabled}
              style={{ minHeight: '44px' }}
            >
              <Volume2 className="mr-2 h-4 w-4" aria-hidden="true" />
              {ttsEnabled ? 'Nonaktifkan TTS' : 'Aktifkan TTS'}
            </Button>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">Kontras Tinggi</span>
            <Button
              type="button"
              variant={highContrast ? 'default' : 'outline'}
              onClick={toggleHighContrast}
              aria-pressed={highContrast}
              style={{ minHeight: '44px' }}
            >
              <Contrast className="mr-2 h-4 w-4" aria-hidden="true" />
              {highContrast ? 'On' : 'Off'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
