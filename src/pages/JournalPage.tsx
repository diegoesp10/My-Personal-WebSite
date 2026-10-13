import { Link } from '../components/Link';
import { ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../components/Blocks';
import { usePortfolio } from '../data/PortfolioContext';
import { formatDate, paragraphs } from '../lib/format';

export const sortedEntries = <T extends { date: string }>(entries: T[]) =>
  [...entries].sort((a, b) => b.date.localeCompare(a.date));

export default function JournalPage() {
  const data = usePortfolio();
  const entries = sortedEntries(data.entries);
  return (
    <>
      <PageHeader
        eyebrow="Diario"
        title={
          <>
            Notas <em className="accent-serif">del camino</em>
          </>
        }
        lead="Lo que construyo, lo que aprendo y lo que vivo fuera de la pantalla."
      />
      <section className="shell section-tight">
        <ol className="journal-list">
          {entries.map((entry) => (
            <li key={entry.id}>
              <Link to={`/diario/${encodeURIComponent(entry.id)}`} className="journal-row">
                <time dateTime={entry.date}>{formatDate(entry.date)}</time>
                <div>
                  <p className="eyebrow">{entry.category}</p>
                  <h2>{entry.title}</h2>
                  <p className="journal-excerpt">{paragraphs(entry.text)[0]}</p>
                </div>
                <ArrowUpRight size={22} strokeWidth={1.5} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ol>
        {!entries.length && <p className="empty">Aquí empieza el siguiente capítulo.</p>}
      </section>
    </>
  );
}
