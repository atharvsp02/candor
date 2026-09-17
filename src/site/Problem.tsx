import { Art, SectionHead, type Tone } from './common';

const FACTS = [
  { value: '1', label: 'ballot per member' },
  { value: '0', label: 'voters identified' },
  { value: '1,024', label: 'seats per poll' },
  { value: '2–8', label: 'options per ballot' },
  { value: '100%', label: 'of the tally on chain' },
];

const PROBLEMS: { tone: Tone; pos: string; title: string; body: string }[] = [
  {
    tone: 'ember',
    pos: '4% 30%',
    title: 'Ballots tied to identities',
    body: 'Most polls know exactly who picked what, so people answer for the audience instead of the truth.',
  },
  {
    tone: 'dusk',
    pos: '62% 72%',
    title: 'Counts you have to trust',
    body: 'Results sit in a database only the organiser can see. There is nothing anyone else can recount.',
  },
  {
    tone: 'gold',
    pos: '96% 46%',
    title: 'One person, many ballots',
    body: 'Make a poll anonymous and duplicates creep in. Make it strict and the anonymity is gone.',
  },
];

export function Facts() {
  return (
    <section className="strip" aria-labelledby="strip-title">
      <h2 id="strip-title" className="kicker kicker-bright">
        Enforced by the contract
      </h2>
      <ul className="strip-row">
        {FACTS.map((fact) => (
          <li key={fact.label}>
            <strong>{fact.value}</strong>
            <span>{fact.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Problem() {
  return (
    <section className="block" id="problem">
      <SectionHead kicker="Problem" title="Honest polls and anonymous voters rarely mix" />
      <div className="grid-3">
        {PROBLEMS.map((problem, index) => (
          <Art key={problem.title} tone={problem.tone} pos={problem.pos} zoom="auto 230%" className="tile">
            <div className="tile-panel">
              <span className="kicker">Problem {index + 1}</span>
              <div>
                <h3>{problem.title}</h3>
                <p>{problem.body}</p>
              </div>
            </div>
          </Art>
        ))}
      </div>
    </section>
  );
}
