import { ArrowRight, Award, Flower2, Leaf, Sprout } from 'lucide-react';
import { journey, nextLesson, lessons, type Progress } from './engine';
export default function Garden({
  progress,
  onContinue,
}: {
  progress: Progress;
  onContinue: () => void;
}) {
  const j = journey(progress);
  const badges = [
    { name: 'První kořínek', done: progress.completed.length > 0, detail: 'První zvládnutá lekce' },
    { name: 'Tisíc malých kroků', done: j.characters >= 1000, detail: '1 000 opsaných znaků' },
    {
      name: 'Čistý proud',
      done: progress.sessions.some((s) => s.errors === 0 && s.characters >= 100),
      detail: '100 znaků bez chyby',
    },
    {
      name: 'Plynutí',
      done: progress.sessions.some((s) => (s.bestCombo ?? 0) >= 50),
      detail: '50 správných stisků v řadě',
    },
  ];
  return (
    <section className="garden">
      <div className={`garden-plant plant-stage-${j.stage}`} aria-hidden="true">
        <span className="plant-soil" />
        <span className="plant-stem" />
        <Leaf className="plant-leaf left" />
        <Leaf className="plant-leaf right" />
        {j.stage >= 2 ? <Flower2 className="plant-bloom" /> : <Sprout className="plant-bloom" />}
      </div>
      <div className="garden-growth">
        <div className="eyebrow">VAŠE ZAHRADA ROSTE S VÁMI</div>
        <h2>
          {j.name} <span>{j.xp} lístků</span>
        </h2>
        <div className="garden-meter">
          <span style={{ width: `${Math.min(100, (j.xp / j.next) * 100)}%` }} />
        </div>
        <p>
          {progress.completed.length} / {lessons.length} zastávek · žádné ztracené dny, jen
          nasbírané zkušenosti
        </p>
        <div className="garden-badges">
          {badges.map((b) => (
            <span key={b.name} className={b.done ? 'earned' : ''} title={b.detail}>
              <Award size={13} />
              {b.name}
              {b.done ? ' ✓' : ''}
            </span>
          ))}
        </div>
      </div>
      <button className="primary-button" onClick={onContinue}>
        {progress.completed.length
          ? `Pokračovat · ${nextLesson(progress.completed) + 1}. lekce`
          : 'Zasadit první semínko'}
        <ArrowRight size={16} />
      </button>
    </section>
  );
}
