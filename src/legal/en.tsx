import { Link } from '../components/Link';
import { openCookiePreferences } from '../consent/consent';
import type { Profile } from '../lib/types';
import { ContactEmail, type LegalDocument } from './shared';

const Mail = ({ profile }: { profile: Profile }) => (
  <ContactEmail profile={profile} fallback="the contact e-mail address" />
);

/**
 * English translation of the legal texts (es.tsx), with the same slugs and sections. The Spanish version prevails if
 * they ever differ, as stated in the legal notice.
 */
export function englishDocuments(profile: Profile): LegalDocument[] {
  const owner = profile.name;
  const place = profile.location || 'Spain';
  return [
    {
      slug: 'aviso-legal',
      title: 'Legal notice',
      short: 'Legal notice',
      lead: 'Who is behind this website and the terms under which you may use what it publishes.',
      sections: [
        {
          id: 'titular',
          title: 'Website owner',
          body: (
            <>
              <p>
                In compliance with article 10 of Spanish Law 34/2002 on information society services
                and electronic commerce (LSSI-CE), these are the details of the owner of
                diegoespinarodriguez.com:
              </p>
              <ul>
                <li>
                  <strong>Owner:</strong> {owner}
                </li>
                <li>
                  <strong>Location:</strong> {place}
                </li>
                <li>
                  <strong>Contact:</strong> <Mail profile={profile} />
                </li>
                <li>
                  <strong>Activity:</strong> professional portfolio and online CV. No products are
                  sold and no services are contracted through the website.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'objeto',
          title: 'Purpose and acceptance',
          body: (
            <>
              <p>
                This notice governs access to and use of the website. By browsing it you accept this
                notice, the <Link to="/legal/terminos">terms of use</Link>, the{' '}
                <Link to="/legal/privacidad">privacy policy</Link> and the{' '}
                <Link to="/legal/cookies">cookie policy</Link>.
              </p>
              <p>
                This English version is a translation provided for convenience. If it ever differs
                from the Spanish version, the Spanish version prevails.
              </p>
            </>
          ),
        },
        {
          id: 'propiedad',
          title: 'Intellectual property',
          body: (
            <>
              <p>
                The texts, design, generative portrait, images and layout of the website belong to{' '}
                {owner}. You may quote or link to them citing the source; for any other use, please
                write to me first.
              </p>
              <p>
                Trademarks, logos and names of companies, clients and technologies belong to their
                owners and are mentioned only to describe professional experience. Source code
                published on GitHub is governed by what each repository states.
              </p>
              <p>
                The website uses third-party components under their own licences: the DM Sans,
                Instrument Serif and JetBrains Mono typefaces (SIL Open Font License), Lucide icons
                (ISC), GSAP, Lenis (MIT), React Bits components (MIT with Commons Clause) and
                Natural Earth map data (public domain).
              </p>
            </>
          ),
        },
        {
          id: 'responsabilidad',
          title: 'Liability',
          body: (
            <p>
              The information on the website is for information purposes and is kept as accurate as
              possible, but it may contain errors or become outdated. I am not liable for damage
              arising from service interruptions, technical failures or the use made of the
              information, except where the law requires it.
            </p>
          ),
        },
        {
          id: 'enlaces',
          title: 'Links',
          body: (
            <p>
              The website links to third-party sites (GitHub, LinkedIn and the websites of the
              projects). I do not control their content or policies and I am not responsible for
              them. You may link to this website as long as the link does not mislead about its
              owner or its content.
            </p>
          ),
        },
        {
          id: 'ley',
          title: 'Applicable law',
          body: (
            <p>
              This notice is governed by Spanish law. Any dispute will be settled before the courts
              that are competent under the applicable rules, including consumer protection rules
              where relevant.
            </p>
          ),
        },
      ],
    },
    {
      slug: 'privacidad',
      title: 'Privacy policy',
      short: 'Privacy',
      lead: 'What data reaches this website, what it is used for and how to exercise your rights under the GDPR.',
      sections: [
        {
          id: 'responsable',
          title: 'Data controller',
          body: (
            <p>
              {owner}, based in {place}. For any question about your data:{' '}
              <Mail profile={profile} />.
            </p>
          ),
        },
        {
          id: 'datos',
          title: 'What data I process and why',
          body: (
            <>
              <h3>If you contact me</h3>
              <p>
                The website has no forms. If you e-mail me, call me or contact me on LinkedIn, I
                process the data you send me (name, e-mail, phone, message) to reply and to consider
                your proposal. The legal basis is your consent when you get in touch and, if we
                discuss working together, steps taken prior to entering into a contract (art. 6.1.a
                and 6.1.b GDPR). I keep the conversation for as long as needed to handle it and, at
                most, two years after the last contact, unless we start a professional relationship.
              </p>
              <h3>Visit statistics</h3>
              <p>
                The visitor map counts how many times each page is viewed, from which approximate
                city and country (with coordinates rounded to about 10 km) and from which website
                visitors arrive (the domain only). To count unique visitors, an identifier is
                computed in memory from the IP address and the browser with a key that changes every
                day and is never stored: it cannot tell who you are or follow you from one day to
                the next. <strong>No IP addresses are stored and no cookies are used</strong>, and
                if your browser asks not to be tracked (Do Not Track or Global Privacy Control) the
                visit is not recorded. The legal basis is the legitimate interest in knowing,
                anonymously, the reach of the website (art. 6.1.f GDPR). Totals are kept for about
                thirteen months and published in aggregate at <Link to="/visitas">/visitas</Link>.
              </p>
              <h3>Security and operation</h3>
              <p>
                To deliver the website and protect it from attacks, Cloudflare processes the IP
                address and the technical data of each request. The server does not store your IP in
                its data and technical logs are rotated automatically. The legal basis is the
                legitimate interest in keeping the website secure and available (art. 6.1.f GDPR).
              </p>
              <h3>GitHub page</h3>
              <p>
                On <Link to="/github">/github</Link> your browser downloads profile pictures from
                GitHub&apos;s servers (avatars.githubusercontent.com), which receive your IP address
                as with any image download. The rest of the GitHub data is fetched by the server,
                without any data about you.
              </p>
            </>
          ),
        },
        {
          id: 'destinatarios',
          title: 'Providers and transfers',
          body: (
            <>
              <p>
                I do not share your data with third parties unless required by law. These providers
                are involved:
              </p>
              <ul>
                <li>
                  <strong>Cloudflare, Inc.</strong>: DNS, delivery and security of the website. It
                  may process data in the United States, covered by the EU-US Data Privacy Framework
                  and standard contractual clauses.
                </li>
                <li>
                  <strong>Microsoft Ireland Operations Ltd.</strong>: server on Azure, in the Spain
                  Central region.
                </li>
                <li>
                  <strong>GitHub, Inc.</strong>: only the profile pictures on the GitHub page.
                </li>
                <li>
                  <strong>Google (Gmail)</strong> and <strong>LinkedIn</strong>: if you contact me
                  through those channels, under their own policies.
                </li>
              </ul>
            </>
          ),
        },
        {
          id: 'derechos',
          title: 'Your rights',
          body: (
            <p>
              You can request access to, rectification or erasure of your data, object to or
              restrict its processing, request its portability or withdraw your consent by writing
              to <Mail profile={profile} />. Visit statistics are anonymous, so they cannot be
              linked to any person. If you believe your rights have not been respected, you can
              lodge a complaint with the Spanish Data Protection Agency (
              <a href="https://www.aepd.es" target="_blank" rel="noreferrer">
                aepd.es
              </a>
              ).
            </p>
          ),
        },
        {
          id: 'menores',
          title: 'Minors',
          body: (
            <p>
              The website is not aimed at children under 14 and does not knowingly process their
              data.
            </p>
          ),
        },
        {
          id: 'cambios',
          title: 'Changes to this policy',
          body: (
            <p>
              If the way data is processed changes, I will update this page and its review date. If
              optional cookies are ever used, your consent will be asked before they are turned on.
            </p>
          ),
        },
      ],
    },
    {
      slug: 'cookies',
      title: 'Cookie policy',
      short: 'Cookies',
      lead: 'This website uses no tracking or advertising cookies. This is everything it stores in your browser.',
      sections: [
        {
          id: 'que-son',
          title: 'What they are',
          body: (
            <p>
              Cookies and local storage are small pieces of data that a website stores in your
              browser to remember something between visits. The law (art. 22.2 LSSI-CE) requires
              your consent except for those that are strictly necessary or that you ask for
              yourself, such as remembering a preference.
            </p>
          ),
        },
        {
          id: 'cuales',
          title: 'What this website uses',
          body: (
            <div className="legal-table-wrap">
              <table className="legal-table">
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Who</th>
                    <th scope="col">Purpose</th>
                    <th scope="col">Duration</th>
                    <th scope="col">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <code>theme</code>
                    </td>
                    <td>This website (local storage)</td>
                    <td>Remember whether you choose the light or dark theme.</td>
                    <td>Until you delete it</td>
                    <td>Preference</td>
                  </tr>
                  <tr>
                    <td>
                      <code>cookie-consent</code>
                    </td>
                    <td>This website (local storage)</td>
                    <td>Store your decision about cookies.</td>
                    <td>Until you delete it</td>
                    <td>Technical</td>
                  </tr>
                  <tr>
                    <td>
                      <code>intro-seen</code>
                    </td>
                    <td>This website (session storage)</td>
                    <td>Avoid repeating the intro animation during the same visit.</td>
                    <td>Until the tab is closed</td>
                    <td>Technical</td>
                  </tr>
                  <tr>
                    <td>
                      <code>__cf_bm</code>
                    </td>
                    <td>Cloudflare</td>
                    <td>Tell people from bots to protect the website; only when needed.</td>
                    <td>30 minutes</td>
                    <td>Security (technical)</td>
                  </tr>
                  <tr>
                    <td>
                      <code>cf_clearance</code>
                    </td>
                    <td>Cloudflare</td>
                    <td>Remember that you have passed a security check.</td>
                    <td>Depends on the check (30 minutes by default)</td>
                    <td>Security (technical)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          ),
        },
        {
          id: 'terceros',
          title: 'No analytics or advertising',
          body: (
            <p>
              There are no analytics, advertising or social media cookies, and no embedded
              third-party content that sets them. Visit statistics do not use cookies (see the{' '}
              <Link to="/legal/privacidad">privacy policy</Link>). If optional cookies are ever
              added, they will not be turned on until you accept them.
            </p>
          ),
        },
        {
          id: 'gestionar',
          title: 'How to manage them',
          body: (
            <>
              <p>
                You can review your choice at any time in the cookie preferences, and delete the
                stored data from your browser&apos;s privacy settings. If you delete it, the website
                will use your system theme again and show you the notice.
              </p>
              <p>
                <button
                  type="button"
                  className="button button-small"
                  onClick={openCookiePreferences}
                >
                  Open cookie preferences
                </button>
              </p>
            </>
          ),
        },
      ],
    },
    {
      slug: 'terminos',
      title: 'Terms of use',
      short: 'Terms',
      lead: 'The terms for using this website: what you can and cannot do, and what you can expect from it.',
      sections: [
        {
          id: 'objeto',
          title: 'Purpose',
          body: (
            <p>
              These terms govern the use of diegoespinarodriguez.com, the professional portfolio of{' '}
              {owner}. Using the website means accepting them together with the{' '}
              <Link to="/legal/aviso-legal">legal notice</Link>.
            </p>
          ),
        },
        {
          id: 'uso',
          title: 'Permitted use',
          body: (
            <>
              <p>
                You may browse the website, share its links and use it to get in touch
                professionally. You may not:
              </p>
              <ul>
                <li>Use it for unlawful purposes or in ways that harm third parties.</li>
                <li>
                  Try to access non-public parts, break its security or overload it. The API limits
                  the number of requests per minute.
                </li>
                <li>
                  Extract its content in bulk or automatically beyond what{' '}
                  <a href="/robots.txt">robots.txt</a> allows.
                </li>
                <li>Impersonate its owner or present its content as your own.</li>
              </ul>
            </>
          ),
        },
        {
          id: 'contenido',
          title: 'Content',
          body: (
            <p>
              The experience, projects and opinions are published in good faith and may change. They
              are not an offer or a contractual commitment. When a client requires it, projects are
              described without details that could identify them.
            </p>
          ),
        },
        {
          id: 'disponibilidad',
          title: 'Availability',
          body: (
            <p>
              I aim to keep the website always available, but it may be interrupted for maintenance,
              technical failures or reasons beyond my control. I may change, extend or remove
              content and features at any time.
            </p>
          ),
        },
        {
          id: 'responsabilidad',
          title: 'Liability',
          body: (
            <p>
              Use of the website is the responsibility of its visitors. I am not liable for damage
              arising from its use or unavailability, except where the law requires it.
            </p>
          ),
        },
        {
          id: 'cambios',
          title: 'Changes and applicable law',
          body: (
            <p>
              These terms may be updated; the version in force is the one published with its review
              date. They are governed by Spanish law.
            </p>
          ),
        },
      ],
    },
  ];
}
