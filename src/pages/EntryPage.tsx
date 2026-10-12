import { Link, useParams } from 'react-router';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { usePortfolio } from '../data/PortfolioContext';
import { formatDate, paragraphs } from '../lib/format';
import { sortedEntries } from './JournalPage';
import NotFoundPage from './NotFoundPage';

export default function EntryPage() {
  const { id } = useParams();
  const entries = sortedEntries(usePortfolio().entries);
  const index = entries.findIndex((entry) => entry.id === id);
  if (index < 0) return <NotFoundPage what="entrada" />;

  const entry = entries[index];
  const newer = entries[index - 1];
  const older = entries[index + 1];
  const text = paragraphs(entry.text);

  return (
    <>
      <PageMeta title={entry.title} description={text[0]} path={`/diario/${entry.id}`} />
      <article className="shell entry">
        <nav className="breadcrumb" aria-label="Ruta">
          <Link to="/diario">
            <ArrowLeft size={15} /> Diario
          </Link>
        </nav>
        <header>
          <p className="eyebrow">
            {entry.category} · <time dateTime={entry.date}>{formatDate(entry.date)}</time>
          </p>
          <h1 className="page-title">{entry.title}</h1>
        </header>
        <div className="prose prose-large">
          {text.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
      <nav className="shell pager" aria-label="Otras entradas">
        {older ? (
          <Link to={`/diario/${older.id}`} rel="prev">
            <span>
              <ArrowLeft size={15} /> Anterior
            </span>
            {older.title}
          </Link>
        ) : (
          <span />
        )}
        {newer && (
          <Link to={`/diario/${newer.id}`} rel="next" className="pager-next">
            <span>
              Siguiente <ArrowRight size={15} />
            </span>
            {newer.title}
          </Link>
        )}
      </nav>
    </>
  );
}
