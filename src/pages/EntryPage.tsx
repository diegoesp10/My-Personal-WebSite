import { useParams } from 'react-router';
import { Link } from '../components/Link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { usePortfolio } from '../data/PortfolioContext';
import { useLanguage } from '../i18n/LanguageContext';
import { paragraphs, useFormat } from '../lib/format';
import { sortedEntries } from './JournalPage';
import NotFoundPage from './NotFoundPage';

export default function EntryPage() {
  const { id } = useParams();
  const entries = sortedEntries(usePortfolio().entries);
  const { t } = useLanguage();
  const format = useFormat();
  const index = entries.findIndex((entry) => entry.id === id);
  if (index < 0) return <NotFoundPage what="entrada" />;

  const entry = entries[index];
  const newer = entries[index - 1];
  const older = entries[index + 1];
  const text = paragraphs(entry.text);

  return (
    <>
      <article className="shell entry">
        <nav className="breadcrumb" aria-label={t.journal.breadcrumb}>
          <Link to="/diario">
            <ArrowLeft size={15} /> {t.journal.back}
          </Link>
        </nav>
        <header>
          <p className="eyebrow">
            {entry.category} · <time dateTime={entry.date}>{format.date(entry.date)}</time>
          </p>
          <h1 className="page-title">{entry.title}</h1>
        </header>
        <div className="prose prose-large">
          {text.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
      <nav className="shell pager" aria-label={t.journal.others}>
        {older ? (
          <Link to={`/diario/${older.id}`} rel="prev">
            <span>
              <ArrowLeft size={15} /> {t.journal.previous}
            </span>
            {older.title}
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link to={`/diario/${newer.id}`} rel="next" className="pager-next">
            <span>
              {t.journal.next} <ArrowRight size={15} />
            </span>
            {newer.title}
          </Link>
        )}
      </nav>
    </>
  );
}
