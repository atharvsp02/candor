import { CIRCUITS } from '../ui/circuits';
import { OPTION_COLORS, ROSTER_CAPACITY } from '../ui/format';

export function ContractCard() {
  return (
    <section className="card contract" aria-labelledby="contract-title">
      <header className="card-head">
        <h3 id="contract-title">What the contract enforces</h3>
        <span className="chip">Compact</span>
      </header>

      <ul className="circuit-list">
        {CIRCUITS.map((circuit, index) => (
          <li key={circuit.name}>
            <span className="circuit-dot" style={{ background: OPTION_COLORS[index] }} />
            <div>
              <code>
                {circuit.name}
                {circuit.args}
              </code>
              <p>{circuit.effect}</p>
            </div>
            <span className="tag">{circuit.note}</span>
          </li>
        ))}
      </ul>

      <dl className="facts contract-facts">
        <div>
          <dt>Roster</dt>
          <dd>{ROSTER_CAPACITY.toLocaleString()} seats</dd>
        </div>
        <div>
          <dt>Options</dt>
          <dd>2 to 8</dd>
        </div>
        <div>
          <dt>Ballots</dt>
          <dd>one per member</dd>
        </div>
      </dl>
    </section>
  );
}
