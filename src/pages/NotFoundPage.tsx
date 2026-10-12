import { Link } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { PageMeta } from '../components/PageMeta';
import { Sculpture } from '../components/ProjectArt';

export default function NotFoundPage({ what = 'página' }: { what?: string }) {
  return (
    <>
      <PageMeta title="No encontrado" path="/404" />
      <section className="shell not-found">
        <div>
          <p className="eyebrow">Error 404</p>
          <h1 className="page-title">
            Esta {what} <em className="accent-serif">no existe.</em>
          </h1>
          <p className="page-lead">Puede que el enlace haya cambiado. Estas rutas sí funcionan:</p>
          <div className="page-actions">
            <Link className="button" to="/">
              Ir al inicio <ArrowRight size={17} />
            </Link>
            <Link className="button button-ghost" to="/proyectos">
              Ver proyectos
            </Link>
          </div>
        </div>
        <Sculpture />
      </section>
    </>
  );
}
