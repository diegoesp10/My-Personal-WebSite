import type { ReactNode } from 'react';
import { Link } from './Link';
import { ArrowRight, ArrowUpRight, Github, Linkedin, Mail, Phone } from 'lucide-react';
import { safeUrl, telUrl } from '../lib/api';
import type { Profile } from '../lib/types';

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
  return (
    <section className="contact-band" aria-labelledby="contact-band-title">
      <div className="shell contact-band-inner" data-reveal>
        <div>
          <p className="eyebrow">Contacto</p>
          <h2 id="contact-band-title">
            ¿Tu proyecto necesita <em className="accent-serif">un buen backend?</em>
          </h2>
        </div>
        <div className="contact-band-actions">
          {profile.email && (
            <a className="button button-light" href={`mailto:${profile.email}`}>
              <Mail size={17} /> Escríbeme
            </a>
          )}
          {phone && (
            <a className="button button-outline-dark" href={phone}>
              <Phone size={17} /> Llámame
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
          <a href={`mailto:${profile.email}`} aria-label={`Correo: ${profile.email}`}>
            <Mail size={18} />
          </a>
        </li>
      )}
    </ul>
  );
}
