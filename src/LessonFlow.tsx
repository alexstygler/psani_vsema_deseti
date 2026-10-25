import { useState, useEffect, useRef, type ReactNode } from 'react';
import { ArrowRight, Check, Keyboard } from 'lucide-react';
import { exerciseOrder, exerciseLabel, lessons, type LessonExercise } from './curriculum';
import { exercisePassed, fingerNames, keyInfo, rows, type Progress } from './engine';

type ExerciseProps = {
  exercise: LessonExercise;
  seed: number;
  onRestart: () => void;
  onNext: () => void;
  nextLabel: string;
};
export default function LessonFlow({
  lesson,
  seed,
  progress,
  onDone,
  renderExercise,
}: {
  lesson: number;
  seed: number;
  progress: Progress;
  onDone: () => void;
  renderExercise: (props: ExerciseProps) => ReactNode;
}) {
  const initial = exerciseOrder.findIndex(
    (exercise) => !exercisePassed(progress.sessions, lesson, exercise),
  );
  const [step, setStep] = useState(Math.max(0, initial));
  const [guide, setGuide] = useState(initial <= 0);
  const [variant, setVariant] = useState(seed);
  const l = lessons[lesson];
  const next = () => {
    if (step < 2) {
      setStep(step + 1);
      setVariant((v) => v + 1);
    } else onDone();
  };
  return (
    <div className="lesson-flow">
      <div className="lesson-stepper" role="group" aria-label="Průběh lekce">
        {exerciseOrder.map((exercise, index) => (
          <button
            key={exercise}
            className={index === step ? 'current-step' : ''}
            disabled={
              !progress.completed.includes(lesson) &&
              index > step &&
              !exercisePassed(progress.sessions, lesson, exerciseOrder[index - 1])
            }
            onClick={() => {
              setStep(index);
              setGuide(index === 0);
              setVariant((v) => v + 1);
            }}
            aria-current={index === step ? 'step' : undefined}
          >
            <span>
              {exercisePassed(progress.sessions, lesson, exercise) ? (
                <Check size={15} />
              ) : (
                index + 1
              )}
            </span>
            {exerciseLabel(lesson, exercise)}
          </button>
        ))}
        <button className="text-button" onClick={() => setGuide((v) => !v)}>
          {guide ? 'Zobrazit cvičení' : 'Ukázat hmaty'}
        </button>
      </div>
      {guide ? (
        <KeyIntroduction lesson={lesson} onStart={() => setGuide(false)} />
      ) : (
        <>
          <div className="lesson-step-title">
            <span>
              Krok {step + 1} ze 3 · {exerciseLabel(lesson, exerciseOrder[step])}
            </span>
            <p>
              {step === 0
                ? 'Nejdřív si hmaty osahejte. Rychlost teď nerozhoduje.'
                : l.precision
                  ? 'Celé zadání, nejvýše 3 chyby. Rychlost nehodnotíme.'
                  : 'Celé zadání, alespoň 150 CPM a nejvýše 3 chyby.'}
            </p>
            {step > 0 && (
              <p>
                Nové hmaty teď spojujeme se všemi dříve naučenými. Jakmile to známá písmena dovolí,
                píšete skutečná slova a věty.
              </p>
            )}
          </div>
          {renderExercise({
            exercise: exerciseOrder[step],
            seed: variant,
            onRestart: () => setVariant((v) => v + 1),
            onNext: next,
            nextLabel:
              step === 2
                ? 'Dokončit lekci a pokračovat'
                : `Pokračovat: ${exerciseLabel(lesson, exerciseOrder[step + 1])}`,
          })}
        </>
      )}
    </div>
  );
}

function shortcut(char: string) {
  const info = keyInfo(char);
  if (!info) return char;
  if (info.alt) return `levý Ctrl + levý Alt + ${info.label}`;
  if (info.dead)
    return `${info.shift ? 's vypnutým Caps Lockem: ' : ''}${info.dead === 'caron' ? 'Shift + ´ (háček)' : '´ (čárka)'}, potom ${info.shift ? 'Shift + ' : ''}${info.label}`;
  if (info.caps) return `Caps Lock, potom ${info.label}; před malými písmeny Caps Lock vypněte`;
  if (info.shift) return `Shift opačné ruky + ${info.label}`;
  return `samostatně ${info.label}`;
}

export function KeyIntroduction({ lesson, onStart }: { lesson: number; onStart: () => void }) {
  const l = lessons[lesson];
  const [seen, setSeen] = useState<string[]>([]);
  const chars = [...l.keys];
  const trial = useRef<HTMLInputElement>(null);
  useEffect(() => {
    trial.current?.focus({ preventScroll: true });
  }, []);
  useEffect(() => {
    const enter = (event: KeyboardEvent) => {
      if (
        event.key !== 'Enter' ||
        event.repeat ||
        event.isComposing ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey
      )
        return;
      if (
        (event.target as HTMLElement).closest(
          'button,input,textarea,select,a,[contenteditable="true"]',
        )
      )
        return;
      event.preventDefault();
      onStart();
    };
    document.addEventListener('keydown', enter);
    return () => document.removeEventListener('keydown', enter);
  }, [onStart]);
  function tryChar(value: string) {
    for (const char of value.normalize('NFC'))
      if (chars.includes(char)) setSeen((v) => [...new Set([...v, char])]);
  }
  const positions = rows.flatMap((row, r) =>
    row.map((key, c) => ({ ...key, x: 18 + r * 16 + c * 45, y: 35 + r * 48 })),
  );
  const targets = [
    ...new Map(
      chars
        .map((char) => keyInfo(char))
        .filter((info) => !!info)
        .map((info) => [info.code, info]),
    ).values(),
  ];
  const homes = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'];
  return (
    <section className="key-intro settings-card" aria-label="Ukázka nových hmatů">
      <div className="key-intro-heading">
        <Keyboard size={27} />
        <div>
          <span className="eyebrow">NEJDŘÍV SE SEZNAMTE</span>
          <h2>{chars.length ? `Nové znaky: ${chars.join(' a ')}` : 'Zopakujeme známé hmaty'}</h2>
        </div>
      </div>
      <p>{l.tip}</p>
      <div className="new-key-cards">
        {chars.map((char) => {
          const info = keyInfo(char);
          return (
            <div key={char} className={seen.includes(char) ? 'key-tried' : ''}>
              <kbd>{char}</kbd>
              <div>
                <strong>{info ? fingerNames[info.finger] : 'známý hmat'}</strong>
                <span>{shortcut(char)}</span>
              </div>
              {seen.includes(char) && <Check size={20} />}
            </div>
          );
        })}
      </div>
      <svg
        className="intro-keyboard"
        viewBox="0 0 680 245"
        role="img"
        aria-label="Česká klávesnice QWERTZ. Nové klávesy jsou zvýrazněné, šipky ukazují cestu ze základní polohy."
      >
        <defs>
          <marker
            id="reach-arrow"
            markerWidth="7"
            markerHeight="7"
            refX="6"
            refY="3.5"
            orient="auto"
          >
            <path d="M0 0 L7 3.5 L0 7" fill="#3c6542" />
          </marker>
        </defs>
        {positions.map((key) => (
          <g
            key={key.code}
            className={
              targets.some((t) => t.code === key.code)
                ? 'new-key'
                : homes.includes(key.code)
                  ? 'home-position'
                  : ''
            }
          >
            <rect x={key.x} y={key.y} width="40" height="34" rx="6" />
            <text x={key.x + 20} y={key.y + 22} textAnchor="middle">
              {key.label}
            </text>
            {['KeyF', 'KeyJ'].includes(key.code) && (
              <line x1={key.x + 14} x2={key.x + 26} y1={key.y + 29} y2={key.y + 29} />
            )}
          </g>
        ))}
        {targets.map((target) => {
          const to = positions.find((k) => k.code === target.code);
          const from = positions.find((k) => k.code === homes[target.finger]);
          return to && from && to.code !== from.code ? (
            <path
              key={target.code}
              d={`M ${from.x + 20} ${from.y - 3} Q ${(from.x + to.x) / 2 + 20} ${Math.min(from.y, to.y) - 24} ${to.x + 20} ${to.y - 3}`}
              fill="none"
              stroke="#3c6542"
              strokeWidth="2"
              markerEnd="url(#reach-arrow)"
            />
          ) : null;
        })}
        <text x="25" y="239" className="intro-layout-label">
          F + J: výstupky pro návrat domů · jen základní blok, bez numerické klávesnice
        </text>
      </svg>
      {lesson < 3 && (
        <p className="intro-note">
          Z prvních několika písmen ještě nevytvoříme česká slova. Začneme krátkými skupinami jako
          ff jj; skutečná slova přijdou od čtvrté lekce.
        </p>
      )}
      {chars.length > 0 && (
        <label className="field-label try-keys">
          Zkuste si nové znaky nanečisto
          <input
            ref={trial}
            aria-label="Vyzkoušet nové znaky"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            onInput={(e) => {
              if ((e.nativeEvent as InputEvent).isComposing) return;
              tryChar(e.currentTarget.value);
              e.currentTarget.value = '';
            }}
            onCompositionEnd={(e) => {
              tryChar(e.currentTarget.value);
              e.currentTarget.value = '';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onStart();
              }
            }}
          />
          <small>Tady nic neměříme. Ověřte si prst a pohyb, potom pokračujte.</small>
        </label>
      )}
      <button className="primary-button" onClick={onStart}>
        Začít cvičení <ArrowRight size={17} />
      </button>
    </section>
  );
}
