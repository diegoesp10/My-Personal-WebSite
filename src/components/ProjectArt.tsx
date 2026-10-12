// Decorative compositions used when a project has no screenshot. They are hidden from assistive technology.

export const artOptions: [string, string][] = [
  ['orange', 'Naranja editorial'],
  ['ink', 'Estudio jurídico'],
  ['wave', 'Onda de audio'],
  ['ledger', 'Libro contable'],
  ['grid', 'Documentos e IA'],
  ['blue', 'Azul geométrico'],
];

// Deterministic waveform: the same bars on every render.
const wave = Array.from({ length: 44 }, (_, i) =>
  Math.round(18 + Math.abs(Math.sin(i * 0.55) * 44 + Math.sin(i * 1.7) * 22)),
);

export function ProjectArt({ kind }: { kind: string }) {
  if (kind === 'ink')
    return (
      <div className="art art-ink" aria-hidden="true">
        <span className="ink-title">MIJARES</span>
        <span className="ink-subtitle">ABOGADOS</span>
        <i className="ink-line" />
        <small>OVIEDO · WORDPRESS</small>
        <b>M.</b>
      </div>
    );
  if (kind === 'wave')
    return (
      <div className="art art-wave" aria-hidden="true">
        <span className="art-caption">transcripción · 00:42:17</span>
        <div className="wave-bars">
          {wave.map((height, i) => (
            <i
              key={i}
              className={i % 11 < 5 ? 'speaker-a' : 'speaker-b'}
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="wave-lines">
          <p>
            <span>00:12</span> <b className="speaker-a">Voz 1</b> Revisamos el despliegue del
            jueves…
          </p>
          <p>
            <span>00:19</span> <b className="speaker-b">Voz 2</b> Queda pendiente la migración.
          </p>
        </div>
      </div>
    );
  if (kind === 'ledger')
    return (
      <div className="art art-ledger" aria-hidden="true">
        <span className="art-caption">allocate(1.000,00 EUR, 3)</span>
        <div className="ledger-sheet">
          <p className="ledger-total">1.000,00 €</p>
          <p>
            <span>parte 1</span> 333,34 €
          </p>
          <p>
            <span>parte 2</span> 333,33 €
          </p>
          <p>
            <span>parte 3</span> 333,33 €
          </p>
          <p className="ledger-check">
            <span>Σ</span> 1.000,00 € ✓
          </p>
        </div>
      </div>
    );
  if (kind === 'grid')
    return (
      <div className="art art-grid" aria-hidden="true">
        <span className="art-caption">documentos · asistente</span>
        <div className="doc-stack">
          <i data-type="PDF" />
          <i data-type="DOCX" />
          <i data-type="XLSX" />
        </div>
        <p className="doc-answer">
          <b>IA</b> Según el contrato (p. 4), el plazo es de 30 días.
        </p>
      </div>
    );
  if (kind === 'blue')
    return (
      <div className="art art-blue" aria-hidden="true">
        <i />
        <i />
        <i />
        <span className="art-caption">idea → sistema</span>
      </div>
    );
  return (
    <div className="art art-orange" aria-hidden="true">
      <span className="art-caption">api ↔ interfaz</span>
      <strong>
        d<span>e.</span>
      </strong>
      <div className="orange-grid" />
    </div>
  );
}

export function Sculpture() {
  return (
    <svg className="sculpture" viewBox="0 0 600 630" aria-hidden="true">
      <defs>
        <linearGradient id="sculpture-material" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#ff8658" />
          <stop offset=".45" stopColor="#f45b2f" />
          <stop offset="1" stopColor="#b62e10" />
        </linearGradient>
        <filter id="sculpture-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="15" />
        </filter>
      </defs>
      <ellipse
        cx="307"
        cy="549"
        rx="187"
        ry="22"
        fill="#412511"
        opacity=".16"
        filter="url(#sculpture-shadow)"
      />
      <g fill="url(#sculpture-material)">
        <path
          d="M117 389V253a159 159 0 0 1 318 0v59h-91v-59a68 68 0 0 0-136 0v136z"
          transform="rotate(-20 276 290)"
        />
        <path
          d="M185 349a143 143 0 0 1 286 0v182h-86V350a57 57 0 0 0-114 0v181h-86z"
          transform="rotate(20 328 400)"
        />
        <circle cx="170" cy="470" r="66" />
      </g>
    </svg>
  );
}
