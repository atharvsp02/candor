import { CheckCircle, Code } from '../ui/icons';
import { CONTRACT_SOURCE_URL } from '../ui/format';
import { PRIVACY_LAYERS } from '../ui/privacyModel';

export function PrivacyModel() {
  return (
    <section className="card model" aria-labelledby="model-title">
      <header className="card-head">
        <h3 id="model-title">The privacy model</h3>
        <a className="btn btn-dark btn-xs" href={CONTRACT_SOURCE_URL} target="_blank" rel="noreferrer">
          <Code size={13} />
          Read the contract
        </a>
      </header>

      <div className="model-cols">
        {PRIVACY_LAYERS.map((layer) => (
          <article key={layer.label}>
            <span className="p-col-title">{layer.label}</span>
            <h4>{layer.title}</h4>
            <p>{layer.sub}</p>
            <strong>{layer.lead}</strong>
            <ul>
              {layer.items.map((item) => (
                <li key={item}>
                  <CheckCircle size={15} />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
