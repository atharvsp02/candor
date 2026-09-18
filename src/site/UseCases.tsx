import { Ballot, Pulse, Shield, Users } from '../ui/icons';
import type { CSSProperties } from 'react';
import { optionLabel, OPTION_COLORS } from '../ui/format';
import { Art, SectionHead, type Tone } from './common';

const USES = [
  {
    tone: 'ember' as Tone,
    pos: '10% 30%',
    question: 'Should we keep shipping every Friday, or is it burning the team out?',
    who: 'Engineering teams',
    role: 'Retrospectives',
    icon: Users,
  },
  {
    tone: 'dusk' as Tone,
    pos: '50% 50%',
    question: 'Do you have confidence in the council to manage the treasury this quarter?',
    who: 'DAOs',
    role: 'Governance',
    icon: Shield,
  },
  {
    tone: 'gold' as Tone,
    pos: '90% 40%',
    question: 'Was this course worth the time you put into it?',
    who: 'Educators',
    role: 'Course feedback',
    icon: Ballot,
  },
  {
    tone: 'ember' as Tone,
    pos: '60% 90%',
    question: 'Have you felt pressure to work unpaid overtime in the last month?',
    who: 'Workplaces',
    role: 'Pulse surveys',
    icon: Users,
  },
  {
    tone: 'dusk' as Tone,
    pos: '0% 70%',
    question: 'Should the moderators remove this account from the community?',
    who: 'Communities',
    role: 'Moderation',
    icon: Shield,
  },
  {
    tone: 'gold' as Tone,
    pos: '30% 10%',
    question: 'Would you raise a safety concern if it involved your own manager?',
    who: 'Research',
    role: 'Sensitive studies',
    icon: Pulse,
  },
];

export function UseCases() {
  return (
    <section className="block" id="use-cases">
      <SectionHead kicker="Use cases" title="For the questions people won’t answer out loud" />
      <div className="grid-3 uses">
        {USES.map(({ tone, pos, question, who, role, icon: Icon }) => (
          <article key={question} className="use">
            <Art tone={tone} pos={pos} zoom="auto 260%" className="use-art">
              <div className="use-panel">
                <span className="use-kicker">Sample ballot</span>
                <blockquote>{question}</blockquote>
                <div className="use-options">
                  {[0, 1, 2].map((option) => (
                    <span key={option} style={{ '--c': OPTION_COLORS[option] } as CSSProperties}>
                      <i />
                      {optionLabel(option)}
                    </span>
                  ))}
                </div>
              </div>
            </Art>
            <footer className="use-foot">
              <span className="use-icon" aria-hidden="true">
                <Icon size={16} />
              </span>
              <div>
                <strong>{who}</strong>
                <span>{role}</span>
              </div>
            </footer>
          </article>
        ))}
      </div>
    </section>
  );
}
