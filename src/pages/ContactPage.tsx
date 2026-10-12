import { useState } from 'react';
import { ArrowUpRight, Check, Copy, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { PageHeader } from '../components/Blocks';
import { PageMeta } from '../components/PageMeta';
import { usePortfolio } from '../data/PortfolioContext';
import { safeUrl } from '../lib/api';

export default function ContactPage() {
  const p = usePortfolio().profile;
  const [copied, setCopied] = useState(false);
  const github = safeUrl(p.github);
  const linkedin = safeUrl(p.linkedin);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(p.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard access can be denied; the address stays visible and selectable.
    }
  };

  return (
    <>
      <PageMeta
        title="Contacto"
        description={`Contacta con ${p.name}, ${p.role}. ${p.availability}`}
        path="/contacto"
      />
      <PageHeader
        eyebrow="Contacto"
        title={
          <>
            Hablemos <em className="accent-serif">de tu proyecto</em>
          </>
        }
        lead={p.availability ? `${p.availability}.` : undefined}
      />
      <section className="shell section-tight">
        {p.email && (
          <div className="email-block">
            <p className="eyebrow">Correo</p>
            <a href={`mailto:${p.email}`} className="email-big">
              {p.email}
            </a>
            <div className="email-actions">
              <a className="button" href={`mailto:${p.email}`}>
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
          {linkedin && (
            <li>
              <a href={linkedin} target="_blank" rel="noreferrer">
                <Linkedin size={22} strokeWidth={1.6} />
                <strong>LinkedIn</strong>
                <span>Trayectoria y recomendaciones</span>
                <ArrowUpRight size={18} className="card-arrow" />
              </a>
            </li>
          )}
          {github && (
            <li>
              <a href={github} target="_blank" rel="noreferrer">
                <Github size={22} strokeWidth={1.6} />
                <strong>GitHub</strong>
                <span>Código y actividad reciente</span>
                <ArrowUpRight size={18} className="card-arrow" />
              </a>
            </li>
          )}
          {p.location && (
            <li>
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
