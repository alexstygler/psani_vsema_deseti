import { symbols } from './symbols';
export default function SymbolGuide({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (char: string) => void;
}) {
  return (
    <details className="symbol-guide">
      <summary>Tahák znaků · Ctrl + Alt · bez numerického bloku</summary>
      <p>
        Držte levý Ctrl a levý Alt, potom stiskněte vyznačenou klávesu. Všechny kombinace používají
        základní českou QWERTZ. Kliknutím vyberete znak k procvičení.
      </p>
      <div className="symbol-grid">
        <button className={!selected ? 'selected' : ''} onClick={() => onSelect('')}>
          Všechny znaky<span>střídat kombinace</span>
        </button>
        {symbols.map((s) => (
          <button
            key={s.char}
            className={selected === s.char ? 'selected' : ''}
            onClick={() => onSelect(s.char)}
            aria-label={`Procvičit ${s.char}: ${s.combo}`}
          >
            <strong>{s.char}</strong>
            <span>{s.combo}</span>
          </button>
        ))}
      </div>
      <p>
        Funkce píšeme anglicky: SUM, IF, AVERAGE, COUNT. Oddělovač argumentů v Excelu závisí na
        jazykovém nastavení; procvičíme čárku i středník. Na macOS se kombinace mohou lišit.
      </p>
    </details>
  );
}
