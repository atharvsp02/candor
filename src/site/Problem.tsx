import { Code, Cpu, Key, Moon, Wallet } from '../ui/icons';
import { Art, SectionHead, type Tone } from './common';

const STACK = [
  { name: 'Midnight', icon: Moon },
  { name: 'Compact', icon: Code },
  { name: 'Midnight.js', icon: Cpu },
  { name: 'Lace', icon: Wallet },
  { name: '1AM', icon: Key },
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

export function Stack() {
  return (
    <section className="stack" aria-labelledby="stack-title">
      <h2 id="stack-title" className="kicker kicker-bright">
        Built on the Midnight stack
      </h2>
      <ul className="stack-row">
        {STACK.map(({ name, icon: Icon }) => (
          <li key={name}>
            <Icon size={18} />
            {name}
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
