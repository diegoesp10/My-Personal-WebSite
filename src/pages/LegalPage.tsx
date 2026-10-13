import { useParams } from 'react-router';
import { PageHeader } from '../components/Blocks';
import { NavLink } from '../components/Link';
import { usePortfolio } from '../data/PortfolioContext';
import { useLanguage } from '../i18n/LanguageContext';
import { LEGAL_UPDATED, legalDocuments } from '../legal/documents';
import { pad, useFormat } from '../lib/format';
import NotFoundPage from './NotFoundPage';

/** /legal/:slug — legal notice, privacy, cookies and terms (texts in legal/es.tsx and legal/en.tsx). */
export default function LegalPage() {
  const { slug } = useParams();
  const { profile } = usePortfolio();
  const { language, t } = useLanguage();
  const format = useFormat();
  const documents = legalDocuments(profile, language);
  const document = documents.find((item) => item.slug === slug);
  if (!document) return <NotFoundPage what="texto legal" />;

  return (
    <>
      <PageHeader eyebrow={t.legal.eyebrow} title={document.title} lead={document.lead}>
        <nav className="legal-tabs" aria-label={t.legal.tabs}>
          {documents.map((item) => (
            <NavLink key={item.slug} to={`/legal/${item.slug}`}>
              {item.short}
            </NavLink>
          ))}
        </nav>
      </PageHeader>
      <div className="shell legal-layout">
        <aside className="legal-toc" aria-labelledby="legal-toc-title">
          <p id="legal-toc-title" className="eyebrow">
            {t.legal.toc}
          </p>
          <ol>
            {document.sections.map((section, index) => (
              <li key={section.id}>
                <a href={`#${section.id}`}>
                  <span>{pad(index + 1)}</span> {section.title}
                </a>
              </li>
            ))}
          </ol>
          <p className="legal-updated">
            {t.legal.updated}
            <time dateTime={LEGAL_UPDATED}>{format.date(LEGAL_UPDATED)}</time>
          </p>
        </aside>
        <article className="legal-article">
          {document.sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-title`}
              data-reveal
            >
              <h2 id={`${section.id}-title`}>
                <span className="legal-index" aria-hidden="true">
                  {pad(index + 1)}
                </span>
                {section.title}
              </h2>
              {section.body}
            </section>
          ))}
        </article>
      </div>
    </>
  );
}
