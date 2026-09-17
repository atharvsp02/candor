import { useEffect } from 'react';
import { SiteNav } from './SiteNav';
import { Hero } from './Hero';
import { Facts, Problem } from './Problem';
import { Features } from './Features';
import { Benefits, Compare, Steps } from './Benefits';
import { Layers } from './Layers';
import { UseCases } from './UseCases';
import { Faq } from './Faq';
import { Closing, SiteFooter } from './Closing';
import { Hatch } from './common';
import '../styles/dash.css';
import '../styles/site.css';

export default function Landing() {
  useEffect(() => {
    document.title = 'Candor · Anonymous polls on Midnight';
  }, []);

  return (
    <div className="site">
      <SiteNav />
      <main className="frame">
        <Hero />
        <Hatch />
        <Facts />
        <Hatch />
        <Problem />
        <Hatch />
        <Features />
        <Hatch />
        <Benefits />
        <Hatch />
        <Compare />
        <Hatch />
        <Steps />
        <Hatch />
        <Layers />
        <Hatch />
        <UseCases />
        <Hatch />
        <Faq />
        <Hatch />
        <Closing />
        <SiteFooter />
      </main>
      <Hatch />
    </div>
  );
}
