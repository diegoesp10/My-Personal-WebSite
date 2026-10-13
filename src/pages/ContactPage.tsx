import { useState, type CSSProperties } from 'react';
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '../components/Blocks';
import { usePortfolio } from '../data/PortfolioContext';
import { safeUrl, telUrl } from '../lib/api';

export default function ContactPage() {
  const p = usePortfolio().profile;
  const [copied, setCopied] = useState(false);
  const github = safeUrl(p.github);
  const linkedin = safeUrl(p.linkedin);
  const phone = telUrl(p.phone);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard access can be denied; the address stays visible and selectable.
    }
  };

  const cards = [
    phone && {
      href: phone,
      icon: Phone,
      title: p.phone,
      text: 'Llamada directa',
      external: false,
    },
    linkedin && {
      href: linkedin,
      icon: Linkedin,
      title: 'LinkedIn',
      text: 'Trayectoria y recomendaciones',
      external: true,
    },
    github && {
      href: github,
      icon: Github,
      title: 'GitHub',
      text: 'Código y actividad reciente',
      external: true,
    },
  ].filter(Boolean) as {
    href: string;
    icon: typeof Phone;
    title: string;
    text: string;
    external: boolean;
  }[];

  return (
    <>
      <PageHeader
        eyebrow="Contacto"
        title={
          <>
            Hablemos <em className="accent-serif">de tu proyecto</em>
          </>
        }
        lead="Cuéntame qué estás construyendo y en qué punto está. Si encaja con lo que hago, lo hablamos."
      />
      <section className="shell section-tight">
        {p.email && (
          <div className="email-block" data-reveal>
            <p className="eyebrow">Correo</p>
            <a href={`mailto:${p.email}`} className="email-big">
              {p.email}
            </a>
            <div className="email-actions">
              <a className="button button-accent" href={`mailto:${p.email}`}>
                <Mail size={17} /> Escribir un correo
              </a>
              <button type="button" className="button button-ghost" onClick={copy}>
                {copied ? <Check size={17} /> : <Copy size={17} />}
                {copied ? 'Copiado' : 'Copiar dirección'}
              </button>
              <span className="visually-hidden" role="status">
                {copied ? 'Dirección copiada al portapapeles' : ''}
              </span>
            </div>
          </div>
        )}
        <ul className="contact-cards">
          {cards.map(({ href, icon: Icon, title, text, external }, index) => (
            <li key={href} data-reveal style={{ '--i': index } as CSSProperties}>
              <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <Icon size={22} strokeWidth={1.6} />
                <strong>{title}</strong>
                <span>{text}</span>
                <ArrowUpRight size={18} className="card-arrow" />
              </a>
            </li>
          ))}
          {p.location && (
            <li data-reveal style={{ '--i': cards.length } as CSSProperties}>
              <div>
                <MapPin size={22} strokeWidth={1.6} />
                <strong>{p.location}</strong>
                <span>{p.availability || 'Remoto o presencial'}</span>
              </div>
            </li>
          )}
        </ul>
      </section>
    </>
  );
}
