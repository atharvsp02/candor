import type { ReactElement } from 'react';
import { Art, SectionHead, reveal, type Tone } from './common';
import { CountUp } from './CountUp';
import { LinkedBallots, RepeatBallots, SealedResults } from './problem-art';

const FACTS: { count?: number; text?: string; suffix?: string; label: string }[] = [
  { count: 1, label: 'ballot per member' },
  { count: 0, label: 'voters identified' },
  { count: 1024, label: 'seats per poll' },
  { text: '2–8', label: 'options per ballot' },
  { count: 100, suffix: '%', label: 'of the tally on chain' },
];

const PROBLEMS: { tone: Tone; pos: string; art: () => ReactElement; title: string; body: string }[] = [
  {
    tone: 'ember',
    pos: '4% 30%',
    art: LinkedBallots,
    title: 'Ballots tied to identities',
    body: 'Most polls know exactly who picked what, so people answer for the audience instead of the truth.',
  },
  {
    tone: 'dusk',
    pos: '62% 72%',
    art: SealedResults,
    title: 'Counts you have to trust',
    body: 'Results sit in a database only the organiser can see. There is nothing anyone else can recount.',
  },
  {
    tone: 'gold',
    pos: '96% 46%',
    art: RepeatBallots,
    title: 'One person, many ballots',
    body: 'Make a poll anonymous and duplicates creep in. Make it strict and the anonymity is gone.',
  },
];

export function Facts() {
  return (
    <section className="strip" aria-labelledby="strip-title">
      <h2 id="strip-title" className="kicker kicker-bright" {...reveal()}>
        Enforced by the contract
      </h2>
      <ul className="strip-row">
        {FACTS.map((fact, index) => (
          <li key={fact.label} {...reveal(index + 1)}>
            <strong>{fact.count === undefined ? fact.text : <CountUp to={fact.count} suffix={fact.suffix} />}</strong>
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
        {PROBLEMS.map((problem, index) => {
          const Illustration = problem.art;
          return (
            <Art
              key={problem.title}
              tone={problem.tone}
              pos={problem.pos}
              zoom="auto 230%"
              className="tile"
              reveal={index}
            >
              <div className="tile-panel">
                <span className="kicker">Problem {index + 1}</span>
                <Illustration />
                <div>
                  <h3>{problem.title}</h3>
                  <p>{problem.body}</p>
                </div>
              </div>
            </Art>
          );
        })}
      </div>
    </section>
  );
}
