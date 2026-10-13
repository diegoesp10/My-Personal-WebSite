import type { CSSProperties } from 'react';
import { CircleDot, Dumbbell, Gauge, Layers, RefreshCw, ShieldCheck } from 'lucide-react';
import physique from '../assets/physique.webp';
import { ContactBand, PageHeader } from '../components/Blocks';
import { PortraitPlate } from '../components/DotPortrait';
import ProfileCard from '../components/reactbits/ProfileCard';
import { usePortfolio } from '../data/PortfolioContext';
import { imageUrl } from '../lib/api';
import { useLanguage } from '../i18n/LanguageContext';
import { emphasis, paragraphs } from '../lib/format';
import { mobilityDetails } from '../lib/portfolio';
import { useThemeColors } from '../lib/useThemeColors';

// Icons of the four working principles, in the order of t.about.principles.
const principleIcons = [Gauge, Layers, RefreshCw, ShieldCheck];

export default function AboutPage() {
  const data = usePortfolio();
  const p = data.profile;
  const portrait = imageUrl(p.portrait);
  const study = data.education[0];
  const { t } = useLanguage();
  const mobility = mobilityDetails(p, t);
  const { dark } = useThemeColors();
  const handle = p.github.match(/github\.com\/([^/?#]+)/i)?.[1] ?? '';

  return (
    <>
      <PageHeader eyebrow={t.about.eyebrow} title={emphasis(t.about.title)} />
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
                <dt>{t.about.base}</dt>
                <dd>{p.location}</dd>
              </div>
            )}
            {p.languages && (
              <div>
                <dt>{t.about.languages}</dt>
                <dd>{p.languages}</dd>
              </div>
            )}
            {mobility.length > 0 && (
              <div>
                <dt>{t.about.mobility}</dt>
                <dd>{mobility.join(' · ')}</dd>
              </div>
            )}
            {study && (
              <div>
                <dt>{t.about.education}</dt>
                <dd>{study.title}</dd>
              </div>
            )}
          </dl>
        </div>
      </section>

      <section className="section band" aria-labelledby="principles-title">
        <div className="shell">
          <p className="eyebrow">{t.about.principlesEyebrow}</p>
          <h2 id="principles-title">{emphasis(t.about.principlesTitle)}</h2>
          <ul className="principles">
            {t.about.principles.map(({ title, text }, index) => {
              const Icon = principleIcons[index % principleIcons.length];
              return (
                <li key={title} data-reveal style={{ '--i': index } as CSSProperties}>
                  <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              );
            })}
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
              title={t.about.cardTitle}
              handle={handle}
              status={p.location}
              contactText={p.email ? t.about.cardContact : ''}
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
            <p className="eyebrow">{t.about.personalEyebrow}</p>
            <h2 id="personal-title">{emphasis(t.about.personalTitle)}</h2>
            <p className="about-lead">{p.personal}</p>
          </div>
        </section>
      )}
      <ContactBand profile={p} />
    </>
  );
}
