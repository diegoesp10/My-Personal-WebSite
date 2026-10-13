import type { ReactNode } from 'react';
import { Link } from '../components/Link';
import { openCookiePreferences } from '../consent/consent';
import type { Profile } from '../lib/types';

export type LegalSection = { id: string; title: string; body: ReactNode };
export type LegalDocument = {
  slug: string;
  title: string;
  /** Name in the legal navigation and the footer. */
  short: string;
  lead: string;
  sections: LegalSection[];
};

/** Legal pages in navigation order, for the footer and the tabs. */
export const legalLinks = [
  { slug: 'aviso-legal', short: 'Aviso legal' },
  { slug: 'privacidad', short: 'Privacidad' },
  { slug: 'cookies', short: 'Cookies' },
  { slug: 'terminos', short: 'Términos' },
];

/** Date of the last review of these texts (yyyy-MM-dd). Update it whenever a text changes. */
export const LEGAL_UPDATED = '2026-10-13';

const Mail = ({ profile }: { profile: Profile }) =>
  profile.email ? (
    <a href={`mailto:${profile.email}`}>{profile.email}</a>
  ) : (
    <>el correo de contacto</>
  );

/**
 * Legal texts of the site: legal notice (LSSI-CE), privacy policy (GDPR), cookie policy and terms of use. They
 * describe what the site actually does; personal data (name, e-mail, location) comes from the content.
 */
export function legalDocuments(profile: Profile): LegalDocument[] {
  const owner = profile.name;
  const place = profile.location || 'España';
  return [
    {
      slug: 'aviso-legal',
      title: 'Aviso legal',
      short: 'Aviso legal',
      lead: 'Quién está detrás de esta web y en qué condiciones puedes usar lo que publica.',
      sections: [
        {
          id: 'titular',
          title: 'Titular del sitio',
          body: (
            <>
              <p>
                En cumplimiento del artículo 10 de la Ley 34/2002, de servicios de la sociedad de la
                información y de comercio electrónico (LSSI-CE), estos son los datos del titular de
                diegoespinarodriguez.com:
              </p>
              <ul>
                <li>
                  <strong>Titular:</strong> {owner}
                </li>
                <li>
                  <strong>Ubicación:</strong> {place}
                </li>
                <li>
                  <strong>Contacto:</strong> <Mail profile={profile} />
                </li>
                <li>
                  <strong>Actividad:</strong> portfolio profesional y currículum en línea. A través
                  de la web no se venden productos ni se contratan servicios.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'objeto',
          title: 'Objeto y aceptación',
          body: (
            <p>
              Este aviso regula el acceso a la web y su uso. Al navegar por ella aceptas este aviso,
              los <Link to="/legal/terminos">términos de uso</Link>, la{' '}
              <Link to="/legal/privacidad">política de privacidad</Link> y la{' '}
              <Link to="/legal/cookies">política de cookies</Link>.
            </p>
          ),
        },
        {
          id: 'propiedad',
          title: 'Propiedad intelectual',
          body: (
            <>
              <p>
                Los textos, el diseño, el retrato generativo, las imágenes y la composición de la
                web son de {owner}. Puedes citarlos o enlazarlos indicando la fuente; para cualquier
                otro uso, escríbeme antes.
              </p>
              <p>
                Las marcas, logotipos y nombres de empresas, clientes y tecnologías pertenecen a sus
                titulares y se mencionan solo para describir la experiencia profesional. El código
                fuente publicado en GitHub se rige por lo indicado en cada repositorio.
              </p>
              <p>
                La web usa componentes de terceros con sus licencias: las tipografías DM Sans,
                Instrument Serif y JetBrains Mono (SIL Open Font License), los iconos Lucide (ISC),
                GSAP, Lenis (MIT), componentes de React Bits (MIT con Commons Clause) y datos
                cartográficos de Natural Earth (dominio público).
              </p>
            </>
          ),
        },
        {
          id: 'responsabilidad',
          title: 'Responsabilidad',
          body: (
            <p>
              La información de la web tiene carácter informativo y se mantiene con la mayor
              exactitud posible, pero puede contener errores o quedar desactualizada. No respondo de
              los daños derivados de interrupciones del servicio, fallos técnicos o del uso que se
              haga de la información, salvo en los casos en que la ley lo exija.
            </p>
          ),
        },
        {
          id: 'enlaces',
          title: 'Enlaces',
          body: (
            <p>
              La web enlaza a sitios de terceros (GitHub, LinkedIn y las webs de los proyectos). No
              controlo su contenido ni sus políticas y no respondo de ellos. Puedes enlazar a esta
              web siempre que el enlace no induzca a error sobre su titular o su contenido.
            </p>
          ),
        },
        {
          id: 'ley',
          title: 'Legislación aplicable',
          body: (
            <p>
              Este aviso se rige por la legislación española. Cualquier controversia se resolverá
              ante los juzgados y tribunales que correspondan según la normativa aplicable, incluida
              la de protección de los consumidores cuando proceda.
            </p>
          ),
        },
      ],
    },
    {
      slug: 'privacidad',
      title: 'Política de privacidad',
      short: 'Privacidad',
      lead: 'Qué datos llegan a esta web, para qué se usan y cómo ejercer tus derechos según el RGPD.',
      sections: [
        {
          id: 'responsable',
          title: 'Responsable del tratamiento',
          body: (
            <p>
              {owner}, con base en {place}. Para cualquier cuestión sobre tus datos:{' '}
              <Mail profile={profile} />.
            </p>
          ),
        },
        {
          id: 'datos',
          title: 'Qué datos trato y para qué',
          body: (
            <>
              <h3>Si me contactas</h3>
              <p>
                La web no tiene formularios. Si me escribes por correo, me llamas o me contactas en
                LinkedIn, trato los datos que me envíes (nombre, correo, teléfono, mensaje) para
                responderte y valorar tu propuesta. La base legal es tu consentimiento al contactar
                y, si conversamos sobre una colaboración, la aplicación de medidas precontractuales
                (art. 6.1.a y 6.1.b del RGPD). Conservo la conversación el tiempo necesario para
                gestionarla y, como máximo, dos años después del último contacto, salvo que
                iniciemos una relación profesional.
              </p>
              <h3>Estadísticas de visitas</h3>
              <p>
                El mapa de visitas cuenta cuántas veces se ve cada página, desde qué ciudad y país
                aproximados (con coordenadas redondeadas a unos 10 km) y desde qué web se llega
                (solo el dominio). Para contar visitantes únicos se calcula en memoria un
                identificador a partir de la IP y el navegador con una clave que cambia cada día y
                nunca se guarda: no permite saber quién eres ni seguirte de un día a otro.{' '}
                <strong>No se guardan direcciones IP ni se usan cookies</strong>, y si tu navegador
                pide no ser rastreado (Do Not Track o Global Privacy Control) la visita no se
                registra. La base legal es el interés legítimo en conocer, de forma anónima, el
                alcance de la web (art. 6.1.f del RGPD). Los totales se conservan unos trece meses y
                se publican agregados en <Link to="/visitas">/visitas</Link>.
              </p>
              <h3>Seguridad y funcionamiento</h3>
              <p>
                Para entregar la web y protegerla de ataques, Cloudflare procesa la dirección IP y
                los datos técnicos de cada petición. El servidor no guarda tu IP en sus datos y los
                registros técnicos se rotan automáticamente. La base legal es el interés legítimo en
                mantener la web segura y disponible (art. 6.1.f del RGPD).
              </p>
              <h3>Página de GitHub</h3>
              <p>
                En <Link to="/github">/github</Link> tu navegador descarga las imágenes de perfil
                desde los servidores de GitHub (avatars.githubusercontent.com), que reciben tu IP
                como en cualquier descarga de imágenes. El resto de datos de GitHub los consulta el
                servidor, sin datos tuyos.
              </p>
            </>
          ),
        },
        {
          id: 'destinatarios',
          title: 'Proveedores y transferencias',
          body: (
            <>
              <p>
                No cedo tus datos a terceros salvo obligación legal. Intervienen estos proveedores:
              </p>
              <ul>
                <li>
                  <strong>Cloudflare, Inc.</strong>: DNS, entrega y seguridad de la web. Puede
                  tratar datos en Estados Unidos, amparado por el Marco de Privacidad de Datos
                  UE-EE. UU. y cláusulas contractuales tipo.
                </li>
                <li>
                  <strong>Microsoft Ireland Operations Ltd.</strong>: servidor en Azure, en la
                  región España Central.
                </li>
                <li>
                  <strong>GitHub, Inc.</strong>: solo las imágenes de perfil de la página de GitHub.
                </li>
                <li>
                  <strong>Google (Gmail)</strong> y <strong>LinkedIn</strong>: si me contactas por
                  esos canales, según sus propias políticas.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'derechos',
          title: 'Tus derechos',
          body: (
            <p>
              Puedes pedir el acceso, la rectificación o la supresión de tus datos, oponerte a su
              tratamiento, limitarlo, solicitar su portabilidad o retirar tu consentimiento
              escribiendo a <Mail profile={profile} />. Las estadísticas de visitas son anónimas,
              así que no pueden asociarse a ninguna persona. Si consideras que no se han atendido
              tus derechos, puedes reclamar ante la Agencia Española de Protección de Datos (
              <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
                aepd.es
              </a>
              ).
            </p>
          ),
        },
        {
          id: 'menores',
          title: 'Menores',
          body: (
            <p>La web no está dirigida a menores de 14 años ni trata conscientemente sus datos.</p>
          ),
        },
        {
          id: 'cambios',
          title: 'Cambios en esta política',
          body: (
            <p>
              Si cambia la forma de tratar los datos, actualizaré esta página y su fecha de
              revisión. Si en el futuro se usan cookies opcionales, se pedirá tu consentimiento
              antes de activarlas.
            </p>
          ),
        },
      ],
    },
    {
      slug: 'cookies',
      title: 'Política de cookies',
      short: 'Cookies',
      lead: 'Esta web no usa cookies de seguimiento ni de publicidad. Esto es todo lo que guarda en tu navegador.',
      sections: [
        {
          id: 'que-son',
          title: 'Qué son',
          body: (
            <p>
              Las cookies y el almacenamiento local son pequeños datos que una web guarda en tu
              navegador para recordar algo entre visitas. La ley (art. 22.2 de la LSSI-CE) exige tu
              consentimiento salvo para los que son estrictamente necesarios o que tú mismo pides,
              como recordar una preferencia.
            </p>
          ),
        },
        {
          id: 'cuales',
          title: 'Qué usa esta web',
          body: (
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th scope="col">Nombre</th>
                    <th scope="col">Quién</th>
                    <th scope="col">Para qué</th>
                    <th scope="col">Duración</th>
                    <th scope="col">Tipo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>theme</code>
                    </td>
                    <td>Esta web (almacenamiento local)</td>
                    <td>Recordar si eliges el tema claro u oscuro.</td>
                    <td>Hasta que lo borres</td>
                    <td>Preferencia</td>
                  </tr>
                  <tr>
                    <td>
                      <code>cookie-consent</code>
                    </td>
                    <td>Esta web (almacenamiento local)</td>
                    <td>Guardar tu decisión sobre cookies.</td>
                    <td>Hasta que lo borres</td>
                    <td>Técnica</td>
                  </tr>
                  <tr>
                    <td>
                      <code>intro-seen</code>
                    </td>
                    <td>Esta web (almacenamiento de sesión)</td>
                    <td>No repetir la animación de entrada en la misma visita.</td>
                    <td>Hasta cerrar la pestaña</td>
                    <td>Técnica</td>
                  </tr>
                  <tr>
                    <td>
                      <code>__cf_bm</code>
                    </td>
                    <td>Cloudflare</td>
                    <td>Distinguir personas de bots para proteger la web; solo si hace falta.</td>
                    <td>30 minutos</td>
                    <td>Técnica de seguridad</td>
                  </tr>
                  <tr>
                    <td>
                      <code>cf_clearance</code>
                    </td>
                    <td>Cloudflare</td>
                    <td>Recordar que has superado una verificación de seguridad.</td>
                    <td>Según la verificación (por defecto, 30 minutos)</td>
                    <td>Técnica de seguridad</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: 'terceros',
          title: 'Sin analítica ni publicidad',
          body: (
            <p>
              No hay cookies de analítica, publicidad ni redes sociales, ni contenido incrustado de
              terceros que las ponga. Las estadísticas de visitas no usan cookies (ver la{' '}
              <Link to="/legal/privacidad">política de privacidad</Link>). Si algún día se añaden
              cookies opcionales, no se activarán hasta que las aceptes.
            </p>
          ),
        },
        {
          id: 'gestionar',
          title: 'Cómo gestionarlas',
          body: (
            <>
              <p>
                Puedes revisar tu elección cuando quieras en las preferencias de cookies, y borrar
                los datos guardados desde la configuración de privacidad de tu navegador. Si los
                borras, la web volverá a usar el tema de tu sistema y a mostrarte el aviso.
              </p>
              <p>
                <button
                  type="button"
                  className="button button-small"
                  onClick={openCookiePreferences}
                >
                  Abrir preferencias de cookies
                </button>
              </p>
            </>
          ),
        },
      ],
    },
    {
      slug: 'terminos',
      title: 'Términos de uso',
      short: 'Términos',
      lead: 'Las condiciones para usar esta web: qué puedes hacer y qué no, y qué puedes esperar de ella.',
      sections: [
        {
          id: 'objeto',
          title: 'Objeto',
          body: (
            <p>
              Estos términos regulan el uso de diegoespinarodriguez.com, el portfolio profesional de{' '}
              {owner}. Usar la web implica aceptarlos junto con el{' '}
              <Link to="/legal/aviso-legal">aviso legal</Link>.
            </p>
          ),
        },
        {
          id: 'uso',
          title: 'Uso permitido',
          body: (
            <>
              <p>
                Puedes consultar la web, compartir sus enlaces y usarla para contactar
                profesionalmente. No está permitido:
              </p>
              <ul>
                <li>Usarla con fines ilícitos o que perjudiquen a terceros.</li>
                <li>
                  Intentar acceder a partes no públicas, vulnerar su seguridad o sobrecargarla. La
                  API limita el número de peticiones por minuto.
                </li>
                <li>
                  Extraer su contenido de forma masiva o automatizada más allá de lo que permite{' '}
                  <a href="/robots.txt">robots.txt</a>.
                </li>
                <li>Hacerse pasar por su titular o presentar su contenido como propio.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'contenido',
          title: 'Contenido',
          body: (
            <p>
              La experiencia, los proyectos y las opiniones se publican de buena fe y pueden
              cambiar. No constituyen una oferta ni un compromiso contractual. Cuando un cliente lo
              requiere, los proyectos se describen sin datos que permitan identificarlo.
            </p>
          ),
        },
        {
          id: 'disponibilidad',
          title: 'Disponibilidad',
          body: (
            <p>
              Procuro que la web esté siempre disponible, pero puede interrumpirse por
              mantenimiento, fallos técnicos o causas ajenas. Puedo modificar, ampliar o retirar
              contenidos y funciones en cualquier momento.
            </p>
          ),
        },
        {
          id: 'responsabilidad',
          title: 'Responsabilidad',
          body: (
            <p>
              El uso de la web es responsabilidad de quien la visita. No respondo de los daños
              derivados de su uso o de su indisponibilidad, salvo en los casos en que la ley lo
              exija.
            </p>
          ),
        },
        {
          id: 'cambios',
          title: 'Cambios y legislación',
          body: (
            <p>
              Estos términos pueden actualizarse; la versión vigente es la publicada con su fecha de
              revisión. Se rigen por la legislación española.
            </p>
          ),
        },
      ],
    },
  ];
}
