import type { CSSProperties } from 'react';
import { CircleDot, Dumbbell, Gauge, Layers, RefreshCw, ShieldCheck } from 'lucide-react';
import physique from '../assets/physique.webp';
import { ContactBand, PageHeader } from '../components/Blocks';
import { PortraitPlate } from '../components/DotPortrait';
import ProfileCard from '../components/reactbits/ProfileCard';
import { usePortfolio } from '../data/PortfolioContext';
import { imageUrl } from '../lib/api';
import { paragraphs } from '../lib/format';
import { mobilityDetails } from '../lib/portfolio';
import { useThemeColors } from '../lib/useThemeColors';

const principles = [
  {
    icon: Gauge,
    title: 'Medir antes de optimizar',
    text: 'Planes de ejecución, tiempos reales y carga real antes de tocar una línea.',
  },
  {
    icon: Layers,
    title: 'Contratos que no se rompen',
    text: 'Las APIs evolucionan en producción sin romper a quien ya las usa.',
  },
  {
    icon: RefreshCw,
    title: 'Consistencia ante fallos',
    text: 'Reintentos, idempotencia y colas para que un fallo externo no deje datos a medias.',
  },
  {
    icon: ShieldCheck,
    title: 'Tests en el pipeline',
    text: 'Cada entrega pasa por pruebas automáticas antes de llegar a producción.',
  },
];

export default function AboutPage() {
  const data = usePortfolio();
  const p = data.profile;
  const portrait = imageUrl(p.portrait);
  const study = data.education[0];
  const mobility = mobilityDetails(p);
  const { dark } = useThemeColors();
  const handle = p.github.match(/github\.com\/([^/?#]+)/i)?.[1] ?? '';

  return (
    <>
      <PageHeader
        eyebrow="Sobre mí"
        title={
          <>
            La persona detrás <em className="accent-serif">del código</em>
          </>
        }
      />
      <section className="shell about-layout">
        <div className="about-visual">
          {portrait ? (
            <img src={portrait} alt={p.name} className="portrait" />
          ) : (
            <PortraitPlate profile={p} tags={[]} caption />
          )}
        </div>
        <div className="about-copy">
          <p className="about-lead">{p.intro}</p>
          <div className="prose">
            {paragraphs(p.bio).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <dl className="about-facts">
            {p.location && (
              <div>
                <dt>Base</dt>
                <dd>{p.location}</dd>
              </div>
            )}
            {p.languages && (
              <div>
                <dt>Idiomas</dt>
                <dd>{p.languages}</dd>
              </div>
            )}
            {mobility.length > 0 && (
              <div>
                <dt>Movilidad</dt>
                <dd>{mobility.join(' · ')}</dd>
              </div>
            )}
            {study && (
              <div>
                <dt>Formación</dt>
                <dd>{study.title}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section className="section band" aria-labelledby="principles-title">
        <div className="shell">
          <p className="eyebrow">Cómo trabajo</p>
          <h2 id="principles-title">
            Cuatro reglas que <em className="accent-serif">no negocio</em>
          </h2>
          <ul className="principles">
            {principles.map(({ icon: Icon, title, text }, index) => (
              <li key={title} data-reveal style={{ '--i': index } as CSSProperties}>
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {p.personal && (
        <section className="shell section personal" aria-labelledby="personal-title">
          <div className="personal-card" data-reveal>
            {/* Holographic card that tilts towards the pointer (React Bits ProfileCard). */}
            <ProfileCard
              avatarUrl={physique}
              name={p.name}
              title="Fuera del código"
              handle={handle}
              status={p.location}
              contactText={p.email ? 'Escríbeme' : ''}
              onContactClick={() => window.location.assign(`mailto:${p.email}`)}
              theme={dark ? 'dark' : 'light'}
              holo={0.55}
              glare={0.4}
              radius={20}
              statusColor="var(--success)"
            />
          </div>
          <div className="personal-copy">
            <div className="personal-icons" aria-hidden="true">
              <Dumbbell size={26} strokeWidth={1.5} />
              <CircleDot size={26} strokeWidth={1.5} />
            </div>
            <p className="eyebrow">Fuera de la pantalla</p>
            <h2 id="personal-title">
              También soy lo que hago <em className="accent-serif">fuera del código</em>
            </h2>
            <p className="about-lead">{p.personal}</p>
          </div>
        </section>
      )}
      <ContactBand profile={p} />
    </>
  );
}
