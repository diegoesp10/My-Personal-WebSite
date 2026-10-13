import type { ReactNode } from 'react';
import { Link } from './Link';
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, Phone } from 'lucide-react';
import { useLanguage } from '../i18n/LanguageContext';
import { safeUrl, telUrl } from '../lib/api';
import { emphasis } from '../lib/format';
import type { Profile } from '../lib/types';
import { DotField } from './DotField';
import Magnet from './reactbits/Magnet';

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="page-header shell">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="page-title">{title}</h1>
      {lead && <p className="page-lead">{lead}</p>}
      {children && <div className="page-actions">{children}</div>}
    </header>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  link,
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  link?: { to: string; label: string };
  id?: string;
}) {
  return (
    <div className="section-heading" data-reveal>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id}>{title}</h2>
      </div>
      {link && (
        <Link className="arrow-link" to={link.to}>
          {link.label} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

export function Tags({ items, limit }: { items: string[]; limit?: number }) {
  const shown = items.filter(Boolean).slice(0, limit ?? items.length);
  if (!shown.length) return null;
  return (
    <ul className="tags">
      {shown.map((tag) => (
        <li key={tag}>{tag}</li>
      ))}
      {limit !== undefined && items.length > limit && (
        <li className="tag-more">+{items.length - limit}</li>
      )}
    </ul>
  );
}

export function ContactBand({ profile }: { profile: Profile }) {
  const phone = telUrl(profile.phone);
  const { t } = useLanguage();
  return (
    <section className="contact-band" aria-labelledby="contact-band-title">
      <DotField color="--band-ink" />
      <div className="shell contact-band-inner" data-reveal>
        <div>
          <p className="eyebrow">{t.blocks.contactEyebrow}</p>
          <h2 id="contact-band-title" data-split>
            {emphasis(t.blocks.contactTitle)}
          </h2>
        </div>
        <div className="contact-band-actions">
          {profile.email && (
            <Magnet padding={70} magnetStrength={3}>
              <a className="button button-light" href={`mailto:${profile.email}`}>
                <Mail size={17} /> {t.blocks.writeMe}
              </a>
            </Magnet>
          )}
          {phone && (
            <a className="button button-outline-dark" href={phone}>
              <Phone size={17} /> {t.blocks.callMe}
            </a>
          )}
          {safeUrl(profile.linkedin) && (
            <a
              className="button button-outline-dark"
              href={safeUrl(profile.linkedin)}
              target="_blank"
              rel="noreferrer"
            >
              <Linkedin size={17} /> LinkedIn <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

export function SocialLinks({ profile }: { profile: Profile }) {
  const { t } = useLanguage();
  return (
    <ul className="social-links">
      {safeUrl(profile.github) && (
        <li>
          <a href={safeUrl(profile.github)} target="_blank" rel="noreferrer" aria-label="GitHub">
            <Github size={18} />
          </a>
        </li>
      )}
      {safeUrl(profile.linkedin) && (
        <li>
          <a
            href={safeUrl(profile.linkedin)}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <Linkedin size={18} />
          </a>
        </li>
      )}
      {profile.email && (
        <li>
          <a href={`mailto:${profile.email}`} aria-label={t.blocks.emailLabel(profile.email)}>
            <Mail size={18} />
          </a>
        </li>
      )}
    </ul>
  );
}
