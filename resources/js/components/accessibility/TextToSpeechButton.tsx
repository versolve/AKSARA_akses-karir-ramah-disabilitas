import { Volume2 } from 'lucide-react';
import { useState, useCallback, useRef, type ReactElement } from 'react';

interface TextToSpeechButtonProps {
  text: string;
  enabled?: boolean;
  iconOnly?: boolean;
  onToggle?: (enabled: boolean) => void;
}

export function TextToSpeechButton({
  text,
  enabled,
  iconOnly = false,
  onToggle,
}: TextToSpeechButtonProps): ReactElement {
  const [isReading, setIsReading] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(
    typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null
  );

  const stopReading = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsReading(false);
  }, []);

  const speakText = useCallback(
    (textContent: string): void => {
      if (!synthRef.current) return;

      if (synthRef.current.speaking) {
        stopReading();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(textContent);
      utterance.lang = 'id-ID';
      utterance.rate = 1.0;
      utterance.volume = 1.0;

      utterance.onstart = (): void => setIsReading(true);
      utterance.onend = (): void => setIsReading(false);
      utterance.onerror = (): void => {
        setIsReading(false);
      };

      synthRef.current.speak(utterance);
    },
    [stopReading],
  );

  const handleClick = useCallback(() => {
    if (iconOnly) {
      onToggle?.(!enabled);
      if (enabled) {
        stopReading();
      } else if (text) {
        speakText(text);
      }
    } else {
      speakText(text);
    }
  }, [iconOnly, enabled, text, speakText, stopReading, onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={isReading ? 'Berhenti membaca' : 'Baca teks'}
      aria-pressed={isReading || enabled}
      className="flex items-center justify-center rounded-lg bg-emerald-700 p-3 text-white hover:bg-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-emerald-600"
      style={{ minWidth: '44px', minHeight: '44px' }}
    >
      <Volume2
        className={`h-5 w-5 ${isReading ? 'animate-pulse' : ''}`}
        aria-hidden="true"
      />
    </button>
  );
}
