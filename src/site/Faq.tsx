import { useState } from 'react';
import { Plus } from '../ui/icons';
import { SectionHead } from './common';

const FAQS = [
  {
    q: 'Can the poll creator see how I voted?',
    a: 'No. The contract only ever checks a proof that some enrolled member is voting. It never learns which member, so there is nothing for the creator, or anyone else, to look up.',
  },
  {
    q: 'What stops someone from voting twice?',
    a: 'Every ballot publishes a nullifier derived from the voter’s secret. The same secret always gives the same nullifier, and the contract rejects any nullifier it has already seen.',
  },
  {
    q: 'Is the option I pick private too?',
    a: 'The option is public, because the tally has to be countable. What stays private is the link between that option and you.',
  },
  {
    q: 'Which wallets work?',
    a: 'Lace and 1AM, set to Midnight Preprod. Any wallet that implements the Midnight DApp Connector API v4 is picked up automatically.',
  },
  {
    q: 'Where is the proof generated?',
    a: 'By the proof server your wallet points to. Run the Midnight proof server locally and your private inputs never leave your machine.',
  },
  {
    q: 'What happens if I clear my browser data?',
    a: 'Your member secret lives in this browser’s storage. Clear it and this browser can no longer vote in the polls it enrolled in, so enrol from the browser you plan to vote with.',
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="block" id="faq">
      <SectionHead kicker="FAQs" title="Frequently asked questions" />
      <div className="faq">
        {FAQS.map((item, index) => {
          const expanded = open === index;
          return (
            <div key={item.q} className={expanded ? 'faq-item is-open' : 'faq-item'}>
              <h3>
                <button
                  id={`faq-q-${index}`}
                  aria-expanded={expanded}
                  aria-controls={`faq-a-${index}`}
                  onClick={() => setOpen(expanded ? null : index)}
                >
                  {item.q}
                  <span className="faq-icon" aria-hidden="true">
                    <Plus size={14} />
                  </span>
                </button>
              </h3>
              <div
                id={`faq-a-${index}`}
                role="region"
                aria-labelledby={`faq-q-${index}`}
                className="faq-answer"
                inert={!expanded}
              >
                <div>
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
