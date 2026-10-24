import { useEffect, useRef, useState } from 'react';
import { Check, Keyboard, RotateCcw } from 'lucide-react';
import type { Progress, Session } from './engine';

export const editorTasks = [
  {
    id: 'caps',
    title: 'Velká čeština',
    keys: 'Caps Lock · Enter',
    instruction:
      'Zapněte Caps Lock a napište první dva řádky. Potom ho vypněte a dopište běžnou větu. Velká Ě, Š, Č, Ř, Ž, Ý, Á, Í, É, Ú a Ů pište jejich českými klávesami se zapnutým Caps Lockem.',
    target: 'ČESKÝ PŘÍBĚH\nĚŠČŘŽÝÁÍÉÚŮ\nTeď zase běžně.',
    initial: '',
  },
  {
    id: 'paragraphs',
    title: 'Odstavce pod prsty',
    keys: 'Tab · Enter',
    instruction:
      'Nadpis ukončete Enterem. Každý další řádek odsaďte jedním Tabem. Znak ⇥ ve vzoru znamená stisk Tab a ↵ znamená Enter; šipky samotné neopisujte.',
    target:
      'Poznámky z porady\n\tPrvní odstavec začíná tabulátorem.\n\tDruhý odstavec má vlastní řádek.',
    initial: '',
  },
  {
    id: 'editing',
    title: 'Opravit a pokračovat',
    keys: 'Backspace · Delete',
    instruction:
      'Kurzor začíná za nadbytečným a ve slově Větaa. Smažte ho Backspacem (maže vlevo). Potom kurzor přesuneme před nadbytečné p ve slově ppomalu: stiskněte Delete (maže vpravo). Na notebooku může být Delete dostupný přes Fn a klávesu označenou Del.',
    target: 'Věta o zahradě.\nRostlina roste pomalu.',
    initial: 'Větaa o zahradě.\nRostlina roste ppomalu.',
  },
] as const;
type Task = (typeof editorTasks)[number];
type Counts = { caps: number; tab: number; enter: number; backspace: number; delete: number };
const initialCounts = (): Counts => ({ caps: 0, tab: 0, enter: 0, backspace: 0, delete: 0 });

export default function EditorLab({
  progress,
  onSave,
}: {
  progress: Progress;
  onSave: (s: Session) => void;
}) {
  const [selected, setSelected] = useState(0);
  const [seed, setSeed] = useState(0);
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">
            <span />
            MALÉ KLÁVESY, VELKÁ JISTOTA
          </div>
          <h1>Ovládněte celý text.</h1>
          <p>Skutečné úpravy dokumentu. Bez CPM, bez časového limitu a bez bodování chyb.</p>
        </div>
      </div>
      <div className="editor-task-list" role="group" aria-label="Klávesové dovednosti">
        {editorTasks.map((task, i) => (
          <button
            key={task.id}
            className={i === selected ? 'active' : ''}
            onClick={() => {
              setSelected(i);
              setSeed((v) => v + 1);
            }}
          >
            <Keyboard size={19} />
            <strong>{task.title}</strong>
            <span>{task.keys}</span>
            {progress.sessions.some((s) => s.mode === 'skills' && s.skill === task.title) && (
              <Check size={16} />
            )}
          </button>
        ))}
      </div>
      <EditorExercise
        key={`${selected}-${seed}`}
        task={editorTasks[selected]}
        device={progress.settings.device}
        onSave={onSave}
        onRepeat={() => setSeed((v) => v + 1)}
        onNext={
          selected < editorTasks.length - 1
            ? () => {
                setSelected((v) => v + 1);
                setSeed((v) => v + 1);
              }
            : undefined
        }
      />
    </>
  );
}
function EditorExercise({
  task,
  device,
  onSave,
  onRepeat,
  onNext,
}: {
  task: Task;
  device: string;
  onSave: (s: Session) => void;
  onRepeat: () => void;
  onNext?: () => void;
}) {
  const [value, setValue] = useState<string>(task.initial);
  const [counts, setCounts] = useState(initialCounts);
  const [capsOn, setCapsOn] = useState(false);
  const [done, setDone] = useState(false);
  const [notice, setNotice] = useState('');
  const editor = useRef<HTMLTextAreaElement>(null);
  const current = useRef<string>(task.initial);
  const finished = useRef(false);
  const clock = useRef({ started: null as number | null, elapsed: 0, characters: 0 });
  const captureTab = useRef(true);
  function startClock() {
    if (clock.current.started === null) clock.current.started = performance.now();
  }
  function pause() {
    const c = clock.current;
    if (c.started !== null) {
      c.elapsed += (performance.now() - c.started) / 1000;
      c.started = null;
    }
  }
  function caret(position: number) {
    requestAnimationFrame(() => {
      editor.current?.focus({ preventScroll: true });
      editor.current?.setSelectionRange(position, position);
    });
  }
  useEffect(() => {
    caret(task.id === 'editing' ? 5 : 0);
    return pause;
  }, []);
  useEffect(() => {
    const hide = () => {
      if (document.hidden) pause();
    };
    window.addEventListener('blur', pause);
    document.addEventListener('visibilitychange', hide);
    return () => {
      window.removeEventListener('blur', pause);
      document.removeEventListener('visibilitychange', hide);
    };
  }, []);
  function apply(next: string, inserted = 0) {
    startClock();
    clock.current.characters += inserted;
    current.current = next.normalize('NFC');
    setValue(current.current);
    setNotice('');
    if (task.id === 'editing' && next === 'Věta o zahradě.\nRostlina roste ppomalu.')
      caret(next.indexOf('ppomalu'));
  }
  const used =
    task.id === 'caps'
      ? counts.caps >= 2 && !capsOn && counts.enter >= 2
      : task.id === 'paragraphs'
        ? counts.tab >= 2 && counts.enter >= 2
        : counts.backspace >= 1 && counts.delete >= 1;
  useEffect(() => {
    if (finished.current || value !== task.target || !used) return;
    finished.current = true;
    pause();
    setDone(true);
    onSave({
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      mode: 'skills',
      lesson: 0,
      skill: task.title,
      device,
      cpm: 0,
      accuracy: 0,
      accuracyMeasured: false,
      errors: 0,
      finished: true,
      seconds: Math.max(0.1, clock.current.elapsed),
      characters: clock.current.characters,
    });
  }, [value, used]);
  useEffect(() => {
    function enter(event: KeyboardEvent) {
      if (
        event.key !== 'Enter' ||
        event.repeat ||
        event.isComposing ||
        event.defaultPrevented ||
        event.ctrlKey ||
        event.altKey ||
        event.metaKey ||
        document.querySelector('dialog[open]')
      )
        return;
      if ((event.target as HTMLElement).closest('button,a,input,textarea,select,summary')) return;
      event.preventDefault();
      if (done) (onNext ?? onRepeat)();
      else editor.current?.focus();
    }
    document.addEventListener('keydown', enter);
    return () => document.removeEventListener('keydown', enter);
  }, [done, onNext, onRepeat]);
  const labels =
    task.id === 'caps'
      ? [
          `Caps Lock: ${counts.caps} / 2 stisky`,
          `Enter: ${counts.enter} / 2`,
          capsOn ? 'Caps Lock je zapnutý' : 'Caps Lock je vypnutý',
        ]
      : task.id === 'paragraphs'
        ? [`Tab: ${counts.tab} / 2`, `Enter: ${counts.enter} / 2`]
        : [`Backspace: ${counts.backspace} / 1`, `Delete: ${counts.delete} / 1`];
  return (
    <section className="editor-lab settings-card">
      <h2>{done ? 'Tohle už máte pod prsty.' : task.title}</h2>
      <p id="editor-instructions">{task.instruction}</p>
      {done ? (
        <div className="editor-complete" role="status">
          <Check size={35} />
          <p>
            Dokument je správně a potřebné klávesy jste použili. Cvičení najdete v historii, bez
            hodnocení rychlosti a přesnosti stisků.
          </p>
          <div>
            <button className="quiet-button" onClick={onRepeat}>
              <RotateCcw size={16} />
              Zkusit znovu
            </button>
            {onNext && (
              <button className="primary-button" onClick={onNext}>
                Další dovednost
              </button>
            )}
          </div>
          <p className="enter-hint">Enter: další dovednost, u poslední nový pokus.</p>
        </div>
      ) : (
        <>
          <div className="editor-requirements">
            {labels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
          <label className="field-label">
            Vzorový dokument
            <pre className="editor-target">
              {task.target.replace(/\t/g, '⇥').replace(/\n/g, '↵\n')}
            </pre>
          </label>
          <label className="field-label">
            Váš dokument
            <textarea
              ref={editor}
              className="document-editor"
              value={value}
              aria-describedby="editor-instructions editor-escape"
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              maxLength={2000}
              onFocus={() => {
                captureTab.current = true;
              }}
              onBlur={pause}
              onChange={(ev) => {
                const native = ev.nativeEvent as InputEvent;
                const added = native.isComposing
                  ? 0
                  : (native.data?.length ??
                    Math.max(0, ev.target.value.length - current.current.length));
                apply(ev.target.value, added);
              }}
              onPaste={(ev) => {
                ev.preventDefault();
                setNotice('V tomto cvičení pište a upravujte text klávesami. Vkládání je vypnuté.');
              }}
              onDrop={(ev) => ev.preventDefault()}
              onKeyUp={(ev) => setCapsOn(ev.getModifierState('CapsLock'))}
              onKeyDown={(ev) => {
                setCapsOn(ev.getModifierState('CapsLock'));
                if (ev.key === 'Escape') {
                  ev.preventDefault();
                  captureTab.current = false;
                  editor.current?.blur();
                  pause();
                  return;
                }
                if (ev.nativeEvent.isComposing) return;
                startClock();
                const field = ev.currentTarget;
                if (ev.key === 'CapsLock' && !ev.repeat)
                  setCounts((c) => ({ ...c, caps: c.caps + 1 }));
                if (ev.key === 'Enter') setCounts((c) => ({ ...c, enter: c.enter + 1 }));
                if (ev.key === 'Backspace')
                  setCounts((c) => ({ ...c, backspace: c.backspace + 1 }));
                if (ev.key === 'Delete') setCounts((c) => ({ ...c, delete: c.delete + 1 }));
                if (
                  ev.key === 'Tab' &&
                  !ev.shiftKey &&
                  captureTab.current &&
                  task.id === 'paragraphs'
                ) {
                  ev.preventDefault();
                  const position = field.selectionStart;
                  const next = value.slice(0, position) + '\t' + value.slice(field.selectionEnd);
                  setCounts((c) => ({ ...c, tab: c.tab + 1 }));
                  apply(next, 1);
                  caret(position + 1);
                }
              }}
            />
          </label>
          <p className="editor-notice" role="status">
            {notice ||
              (value === task.target && !used
                ? 'Text už odpovídá. Ještě použijte požadované klávesy uvedené výše.'
                : 'Pracujte přímo v dokumentu. Enter vytváří nový řádek.')}
          </p>
          <p className="footnote" id="editor-escape">
            V odstavcovém cvičení Tab vkládá tabulátor. Shift + Tab opustí pole; Escape uvolní psaní
            a Tab pak ovládá stránku. V úpravách textu Tab běžně přesouvá fokus.
          </p>
          <button className="quiet-button" onClick={onRepeat}>
            <RotateCcw size={15} />
            Začít znovu
          </button>
        </>
      )}
    </section>
  );
}
