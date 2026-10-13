import { useEffect, useRef, useState } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { Link } from '../components/Link';
import { useLanguage } from '../i18n/LanguageContext';
import { onOpenCookiePreferences, saveConsent, useConsent, type ConsentCategory } from './consent';

// Optional categories, none in use today; their texts are in the dictionaries (t.consent).
const optional: ConsentCategory[] = ['analytics', 'marketing'];

/**
 * Cookie notice and preferences. The site uses no optional cookies today, so the notice informs and lets the
 * visitor record a choice; any optional script added later must ask hasConsent() first. The preferences open
 * from the notice or from the cookie preferences link in the footer.
 */
export function CookieConsent() {
  const consent = useConsent();
  const dialog = useRef<HTMLDialogElement>(null);
  const [choice, setChoice] = useState({ analytics: false, marketing: false });
  const { t } = useLanguage();

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
            <h2 id="cookie-notice-title">{t.consent.noticeTitle}</h2>
            <p>
              {t.consent.noticeText} <Link to="/legal/cookies">{t.consent.policy}</Link>
            </p>
          </div>
          <div className="cookie-actions">
            <button type="button" className="button button-small button-ghost" onClick={open}>
              {t.consent.configure}
            </button>
            <button
              type="button"
              className="button button-small"
              onClick={() => save({ analytics: false, marketing: false })}
            >
              {t.consent.accept}
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
            <p className="eyebrow">{t.consent.eyebrow}</p>
            <h2 id="cookie-dialog-title">{t.consent.title}</h2>
            <button
              type="button"
              className="icon-button cookie-close"
              aria-label={t.consent.close}
              onClick={() => dialog.current?.close()}
            >
              <X size={18} />
            </button>
          </header>
          <ul className="cookie-categories">
            <li>
              <div>
                <h3>
                  <ShieldCheck size={16} aria-hidden="true" /> {t.consent.technical}
                </h3>
                <p>{t.consent.technicalText}</p>
              </div>
              <span className="cookie-always">{t.consent.always}</span>
            </li>
            {optional.map((id) => (
              <li key={id}>
                <div>
                  <h3>{t.consent[id]}</h3>
                  <p>{t.consent[`${id}Text`]}</p>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={choice[id]}
                    onChange={(event) => setChoice({ ...choice, [id]: event.target.checked })}
                  />
                  <span aria-hidden="true" />
                  <span className="visually-hidden">{t.consent.allow(t.consent[id])}</span>
                </label>
              </li>
            ))}
          </ul>
          <footer>
            <Link to="/legal/cookies" onClick={() => dialog.current?.close()}>
              {t.consent.policy}
            </Link>
            <div className="cookie-actions">
              <button
                type="button"
                className="button button-small button-ghost"
                onClick={() => save({ analytics: false, marketing: false })}
              >
                {t.consent.reject}
              </button>
              <button type="submit" className="button button-small">
                {t.consent.save}
              </button>
            </div>
          </footer>
        </form>
      </dialog>
    </>
  );
}
