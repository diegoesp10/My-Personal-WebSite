import { useEffect, useRef, useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { Link } from '../components/Link';
import { onOpenCookiePreferences, saveConsent, useConsent, type ConsentCategory } from './consent';

const optional: { id: ConsentCategory; title: string; text: string }[] = [
  {
    id: 'analytics',
    title: 'Analítica',
    text: 'Ahora mismo no se usan. Las estadísticas del mapa de visitas son anónimas, sin cookies y sin guardar tu IP.',
  },
  {
    id: 'marketing',
    title: 'Publicidad y redes sociales',
    text: 'Ahora mismo no se usan. Si algún día se añaden, solo se activarán si lo permites aquí.',
  },
];

/**
 * Cookie notice and preferences. The site uses no optional cookies today, so the notice informs and lets the
 * visitor record a choice; any optional script added later must ask hasConsent() first. The preferences open
 * from the notice or from "Preferencias de cookies" in the footer.
 */
export function CookieConsent() {
  const consent = useConsent();
  const dialog = useRef<HTMLDialogElement>(null);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });

  useEffect(
    () =>
      onOpenCookiePreferences(() => {
        setChoice({
          analytics: consent?.analytics ?? false,
          marketing: consent?.marketing ?? false,
        });
        dialog.current?.showModal();
      }),
    [consent],
  );

  const open = () => {
    setChoice({ analytics: consent?.analytics ?? false, marketing: consent?.marketing ?? false });
    dialog.current?.showModal();
  };
  const save = (value: typeof choice) => {
    saveConsent(value);
    dialog.current?.close();
  };

  return (
    <>
      {!consent && (
        <section className="cookie-notice" aria-labelledby="cookie-notice-title">
          <Cookie size={22} strokeWidth={1.6} aria-hidden="true" />
          <div>
            <h2 id="cookie-notice-title">Sin cookies de seguimiento</h2>
            <p>
              Esta web no usa cookies de analítica ni de publicidad. Solo guarda en tu navegador el
              tema que eliges y esta decisión. <Link to="/legal/cookies">Política de cookies</Link>
            </p>
          </div>
          <div className="cookie-actions">
            <button type="button" className="button button-small button-ghost" onClick={open}>
              Configurar
            </button>
            <button
              type="button"
              className="button button-small"
              onClick={() => save({ analytics: false, marketing: false })}
            >
              Entendido
            </button>
          </div>
        </section>
      )}

      <dialog
        ref={dialog}
        className="cookie-dialog"
        aria-labelledby="cookie-dialog-title"
        data-lenis-prevent
      >
        <form method="dialog" className="cookie-dialog-inner" onSubmit={() => save(choice)}>
          <header>
            <p className="eyebrow">Privacidad</p>
            <h2 id="cookie-dialog-title">Preferencias de cookies</h2>
            <button
              type="button"
              className="icon-button cookie-close"
              aria-label="Cerrar"
              onClick={() => dialog.current?.close()}
            >
              <X size={18} />
            </button>
          </header>
          <ul className="cookie-categories">
            <li>
              <div>
                <h3>
                  <ShieldCheck size={16} aria-hidden="true" /> Técnicas y de preferencias
                </h3>
                <p>
                  Tu tema claro u oscuro, esta decisión y, si hace falta verificar una visita, las
                  cookies de seguridad de Cloudflare. Son necesarias para que la web funcione.
                </p>
              </div>
              <span className="cookie-always">Siempre activas</span>
            </li>
            {optional.map(({ id, title, text }) => (
              <li key={id}>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={choice[id]}
                    onChange={(event) => setChoice({ ...choice, [id]: event.target.checked })}
                  />
                  <span aria-hidden="true" />
                  <span className="visually-hidden">Permitir {title.toLowerCase()}</span>
                </label>
              </li>
            ))}
          </ul>
          <footer>
            <Link to="/legal/cookies" onClick={() => dialog.current?.close()}>
              Política de cookies
            </Link>
            <div className="cookie-actions">
              <button
                type="button"
                className="button button-small button-ghost"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                Rechazar opcionales
              </button>
              <button type="submit" className="button button-small">
                Guardar
              </button>
            </div>
          </footer>
        </form>
      </dialog>
    </>
  );
}
