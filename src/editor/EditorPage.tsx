import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowDown, ArrowLeft, ArrowUp, Check, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import { BrandMark } from '../components/Brand';
import { artOptions } from '../components/ProjectArt';
import { usePortfolioState } from '../data/PortfolioContext';
import { imageUrl, request } from '../lib/api';
import type { Portfolio, Profile } from '../lib/types';
import { Field, ListField } from './fields';

type Collection = 'projects' | 'experience' | 'education' | 'skills' | 'entries' | 'metrics';
type Tab = 'profile' | Collection;

const tabs: [Tab, string][] = [
  ['profile', 'Perfil'],
  ['projects', 'Proyectos'],
  ['experience', 'Experiencia'],
  ['education', 'Formación'],
  ['skills', 'Competencias'],
  ['entries', 'Diario'],
  ['metrics', 'Cifras'],
];

const hints: Record<Collection, string> = {
  projects:
    'El orden es el de la web. Los proyectos «destacados» aparecen en la portada (hasta cuatro).',
  experience: 'El orden es el del CV: pon primero el puesto más reciente.',
  education: 'Títulos y cursos. Las fechas pueden ser un año (2023) o un mes (2023-06).',
  skills: 'Cada grupo aparece en el CV online con sus etiquetas.',
  entries: 'Las entradas se ordenan por fecha. Separa los párrafos con una línea en blanco.',
  metrics: 'Cifras reales con contexto. Si no hay ninguna, la sección no aparece.',
};

const today = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

export default function EditorPage() {
  const { data, canEdit, replace } = usePortfolioState();
  const navigate = useNavigate();
  useEffect(() => {
    document.title = 'Editor · Diego Espina';
  }, []);

  if (!data || canEdit === undefined)
    return (
      <div className="status-screen" aria-busy="true">
        <BrandMark />
        <p>Abriendo el editor…</p>
      </div>
    );
  if (!canEdit)
    return (
      <div className="status-screen">
        <BrandMark />
        <h1>Editor local</h1>
        <p>
          La edición solo está disponible al ejecutar la API en modo Development desde este equipo.
        </p>
        <button type="button" className="button" onClick={() => navigate('/')}>
          Volver a la web
        </button>
      </div>
    );
  return <Editor data={data} onSave={replace} onClose={() => navigate('/')} />;
}

function Editor({
  data,
  onSave,
  onClose,
}: {
  data: Portfolio;
  onSave: (d: Portfolio) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState(() => structuredClone(data));
  const [tab, setTab] = useState<Tab>('profile');
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const before = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener('beforeunload', before);
    return () => window.removeEventListener('beforeunload', before);
  }, [dirty]);

  function change(fn: (d: Portfolio) => void) {
    setDraft((prev) => {
      const d = structuredClone(prev);
      fn(d);
      return d;
    });
    setDirty(true);
    setMessage('');
  }

  async function save() {
    setBusy(true);
    setMessage('');
    try {
      const saved = await request<Portfolio>('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'X-Portfolio-Editor': 'local' },
        body: JSON.stringify(draft),
      });
      setDraft(saved);
      onSave(saved);
      setDirty(false);
      setFailed(false);
      setMessage('Guardado. La web ya muestra los cambios.');
    } catch (e) {
      setFailed(true);
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function upload(file: File | undefined, apply: (url: string) => void) {
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const form = new FormData();
      form.append('file', file);
      const r = await request<{ url: string }>('/api/uploads', {
        method: 'POST',
        headers: { 'X-Portfolio-Editor': 'local' },
        body: form,
      });
      apply(r.url);
      setFailed(false);
      setMessage('Imagen subida. Guarda los cambios para publicarla.');
    } catch (e) {
      setFailed(true);
      setMessage((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const profileField = (
    label: string,
    key: keyof Profile,
    options: { multiline?: boolean; type?: string; hint?: string } = {},
  ) => (
    <Field
      label={label}
      value={draft.profile[key]}
      onChange={(v) =>
        change((d) => {
          d.profile[key] = v;
        })
      }
      {...options}
    />
  );

  const imageField = (url: string, apply: (v: string) => void, name: string) => (
    <div className="image-field">
      {imageUrl(url) && <img src={imageUrl(url)} alt={name} />}
      <label className="upload-button">
        <Upload size={16} />
        {uploading ? 'Subiendo…' : 'Subir imagen'}
        <input
          aria-label={`Subir imagen de ${name}`}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={uploading || busy}
          onChange={(e) => {
            void upload(e.target.files?.[0], apply);
            e.target.value = '';
          }}
        />
      </label>
      {url && (
        <button className="text-button" type="button" onClick={() => apply('')}>
          <X size={14} /> Quitar imagen
        </button>
      )}
      <small>PNG, JPEG o WebP. Máximo 8 MB.</small>
    </div>
  );

  function add(kind: Collection) {
    change((d) => {
      const id = crypto.randomUUID();
      if (kind === 'projects')
        d.projects.push({
          id,
          title: 'Nuevo proyecto',
          category: 'Backend .NET',
          description: '',
          details: '',
          year: String(new Date().getFullYear()),
          status: 'En desarrollo',
          url: '',
          image: '',
          tags: [],
          art: 'orange',
          featured: false,
          highlights: [],
          links: [],
        });
      if (kind === 'experience')
        d.experience.unshift({
          id,
          role: 'Nuevo puesto',
          company: 'Empresa',
          companyUrl: '',
          start: today().slice(0, 7),
          end: '',
          location: '',
          summary: '',
          highlights: [],
          stack: [],
        });
      if (kind === 'education')
        d.education.unshift({
          id,
          title: 'Nueva formación',
          center: '',
          location: '',
          start: '',
          end: '',
        });
      if (kind === 'entries')
        d.entries.unshift({
          id,
          title: 'Nueva entrada',
          date: today(),
          category: 'Aprendizaje',
          text: '',
        });
      if (kind === 'skills') d.skills.push({ id, title: 'Nuevo grupo', description: '', tags: [] });
      if (kind === 'metrics') d.metrics.push({ id, value: '', label: '' });
    });
  }

  function remove(kind: Collection, index: number) {
    if (confirm('¿Eliminar este elemento? El cambio se aplicará al guardar.'))
      change((d) => {
        d[kind].splice(index, 1);
      });
  }

  function move(kind: Collection, index: number, delta: number) {
    change((d) => {
      const list = d[kind] as unknown[];
      const target = index + delta;
      if (target < 0 || target >= list.length) return;
      [list[index], list[target]] = [list[target], list[index]];
    });
  }

  function close() {
    if (!dirty || confirm('Hay cambios sin guardar. ¿Salir del editor y descartarlos?')) onClose();
  }

  const cardHeading = (
    kind: Collection,
    index: number,
    title: string,
    length: number,
    sortable = true,
  ) => (
    <div className="editor-card-heading">
      <h2>{title || 'Sin título'}</h2>
      <div className="editor-card-tools">
        {sortable && (
          <>
            <button
              type="button"
              className="icon-button"
              aria-label={`Subir ${title}`}
              disabled={index === 0}
              onClick={() => move(kind, index, -1)}
            >
              <ArrowUp size={17} />
            </button>
            <button
              type="button"
              className="icon-button"
              aria-label={`Bajar ${title}`}
              disabled={index === length - 1}
              onClick={() => move(kind, index, 1)}
            >
              <ArrowDown size={17} />
            </button>
          </>
        )}
        <button
          type="button"
          className="icon-button is-danger"
          aria-label={`Eliminar ${title}`}
          onClick={() => remove(kind, index)}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="editor-page">
      <header className="editor-header">
        <button type="button" className="text-button" onClick={close}>
          <ArrowLeft size={18} /> Volver a la web
        </button>
        <span className="editor-status">
          <span className="pulse" aria-hidden="true" /> Editor local
        </span>
        <button
          type="button"
          className="button"
          onClick={save}
          disabled={!dirty || busy || uploading}
        >
          <Save size={16} />
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </header>
      <div className="editor-shell">
        <div className="editor-intro">
          <p className="eyebrow">Contenido de la web</p>
          <h1>
            Hazlo <em className="accent-serif">tuyo.</em>
          </h1>
          <p className="muted">
            Los cambios se guardan en este equipo al pulsar «Guardar cambios». Para Docker o
            producción, copia después el contenido de App_Data.
          </p>
        </div>
        <div className="editor-tabs" role="tablist" aria-label="Secciones">
          {tabs.map(([key, label]) => (
            <button
              key={key}
              type="button"
              role="tab"
              id={`tab-${key}`}
              aria-controls="editor-panel"
              aria-selected={key === tab}
              onClick={() => setTab(key)}
              className={tab === key ? 'is-active' : ''}
            >
              {label}
            </button>
          ))}
        </div>
        {message && (
          <div
            className={`message ${failed ? 'is-error' : 'is-success'}`}
            role={failed ? 'alert' : 'status'}
          >
            {!failed && <Check size={17} />} {message}
          </div>
        )}
        <div id="editor-panel" role="tabpanel" aria-labelledby={`tab-${tab}`}>
          <fieldset className="editor-fieldset" disabled={busy || uploading}>
            {tab === 'profile' && (
              <div className="editor-card">
                <h2>Perfil</h2>
                <div className="form-grid">
                  {profileField('Nombre', 'name')}
                  {profileField('Especialidad', 'role')}
                  {profileField('Titular de la portada', 'headline', {
                    hint: 'Rodea con asteriscos el texto que quieras en cursiva: Backends que *aguantan*.',
                  })}
                  {profileField('Disponibilidad', 'availability')}
                  {profileField('Presentación breve', 'intro', { multiline: true })}
                  {profileField('Sobre mí', 'bio', {
                    multiline: true,
                    hint: 'Separa los párrafos con una línea en blanco.',
                  })}
                  {profileField('Fuera de la pantalla', 'personal', { multiline: true })}
                  {profileField('Idiomas', 'languages')}
                  {profileField('Ubicación', 'location')}
                  {profileField('Correo de contacto', 'email', { type: 'email' })}
                  {profileField('GitHub', 'github', { type: 'url' })}
                  {profileField('LinkedIn', 'linkedin', { type: 'url' })}
                </div>
                <h3>Retrato (opcional)</h3>
                {imageField(
                  draft.profile.portrait,
                  (v) =>
                    change((d) => {
                      d.profile.portrait = v;
                    }),
                  'perfil',
                )}
              </div>
            )}
            {tab !== 'profile' && (
              <div className="collection-bar">
                <p>{hints[tab]}</p>
                <button type="button" className="button button-ghost" onClick={() => add(tab)}>
                  <Plus size={16} /> Añadir
                </button>
              </div>
            )}

            {tab === 'projects' &&
              draft.projects.map((p, i) => (
                <article key={p.id} className="editor-card">
                  {cardHeading('projects', i, p.title, draft.projects.length)}
                  <label className="check-field">
                    <input
                      type="checkbox"
                      checked={p.featured}
                      onChange={(e) =>
                        change((d) => {
                          d.projects[i].featured = e.target.checked;
                        })
                      }
                    />
                    Destacado en la portada
                  </label>
                  <div className="form-grid">
                    <Field
                      label="Título"
                      value={p.title}
                      onChange={(v) => change((d) => void (d.projects[i].title = v))}
                    />
                    <Field
                      label="Categoría"
                      value={p.category}
                      onChange={(v) => change((d) => void (d.projects[i].category = v))}
                    />
                    <Field
                      label="Resumen"
                      value={p.description}
                      multiline
                      onChange={(v) => change((d) => void (d.projects[i].description = v))}
                    />
                    <Field
                      label="Historia del proyecto"
                      value={p.details}
                      multiline
                      hint="Separa los párrafos con una línea en blanco."
                      onChange={(v) => change((d) => void (d.projects[i].details = v))}
                    />
                    <Field
                      label="Año"
                      value={p.year}
                      onChange={(v) => change((d) => void (d.projects[i].year = v))}
                    />
                    <Field
                      label="Estado"
                      value={p.status}
                      onChange={(v) => change((d) => void (d.projects[i].status = v))}
                    />
                    <Field
                      label="Web en producción"
                      type="url"
                      value={p.url}
                      onChange={(v) => change((d) => void (d.projects[i].url = v))}
                    />
                    <ListField
                      label="Tecnologías (separadas por comas)"
                      value={p.tags}
                      onChange={(v) => change((d) => void (d.projects[i].tags = v))}
                    />
                    <ListField
                      label="Lo más destacado (una línea por punto)"
                      value={p.highlights}
                      lines
                      onChange={(v) => change((d) => void (d.projects[i].highlights = v))}
                    />
                    <label className="form-field">
                      <span>Composición visual sin imagen</span>
                      <select
                        value={p.art}
                        onChange={(e) => change((d) => void (d.projects[i].art = e.target.value))}
                      >
                        {artOptions.map(([value, label]) => (
                          <option key={value} value={value}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                  <h3>Enlaces (repositorios, demos…)</h3>
                  <div className="link-rows">
                    {p.links.map((link, j) => (
                      <div key={j} className="link-row">
                        <Field
                          label="Texto"
                          value={link.label}
                          onChange={(v) => change((d) => void (d.projects[i].links[j].label = v))}
                        />
                        <Field
                          label="Dirección"
                          type="url"
                          value={link.url}
                          onChange={(v) => change((d) => void (d.projects[i].links[j].url = v))}
                        />
                        <button
                          type="button"
                          className="icon-button is-danger"
                          aria-label={`Quitar enlace ${link.label}`}
                          onClick={() => change((d) => void d.projects[i].links.splice(j, 1))}
                        >
                          <X size={17} />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-button"
                      disabled={p.links.length >= 6}
                      onClick={() =>
                        change(
                          (d) =>
                            void d.projects[i].links.push({
                              label: 'Repositorio',
                              url: 'https://github.com/',
                            }),
                        )
                      }
                    >
                      <Plus size={15} /> Añadir enlace
                    </button>
                  </div>
                  <h3>Imagen o captura</h3>
                  {imageField(
                    p.image,
                    (v) => change((d) => void (d.projects[i].image = v)),
                    p.title,
                  )}
                </article>
              ))}

            {tab === 'experience' &&
              draft.experience.map((x, i) => (
                <article key={x.id} className="editor-card">
                  {cardHeading(
                    'experience',
                    i,
                    `${x.role} · ${x.company}`,
                    draft.experience.length,
                  )}
                  <div className="form-grid">
                    <Field
                      label="Puesto"
                      value={x.role}
                      onChange={(v) => change((d) => void (d.experience[i].role = v))}
                    />
                    <Field
                      label="Empresa"
                      value={x.company}
                      onChange={(v) => change((d) => void (d.experience[i].company = v))}
                    />
                    <Field
                      label="Web de la empresa (opcional)"
                      type="url"
                      value={x.companyUrl}
                      onChange={(v) => change((d) => void (d.experience[i].companyUrl = v))}
                    />
                    <Field
                      label="Modalidad o ubicación"
                      value={x.location}
                      onChange={(v) => change((d) => void (d.experience[i].location = v))}
                    />
                    <Field
                      label="Inicio"
                      type="month"
                      value={x.start}
                      onChange={(v) => change((d) => void (d.experience[i].start = v))}
                    />
                    <div className="form-field">
                      <Field
                        label="Fin"
                        type="month"
                        value={x.end}
                        onChange={(v) => change((d) => void (d.experience[i].end = v))}
                      />
                      <label className="check-field">
                        <input
                          type="checkbox"
                          checked={!x.end}
                          onChange={(e) =>
                            change(
                              (d) =>
                                void (d.experience[i].end = e.target.checked
                                  ? ''
                                  : today().slice(0, 7)),
                            )
                          }
                        />
                        Puesto actual
                      </label>
                    </div>
                    <Field
                      label="Resumen"
                      value={x.summary}
                      multiline
                      onChange={(v) => change((d) => void (d.experience[i].summary = v))}
                    />
                    <ListField
                      label="Logros (una línea por punto)"
                      value={x.highlights}
                      lines
                      onChange={(v) => change((d) => void (d.experience[i].highlights = v))}
                    />
                    <ListField
                      label="Tecnologías (separadas por comas)"
                      value={x.stack}
                      onChange={(v) => change((d) => void (d.experience[i].stack = v))}
                    />
                  </div>
                </article>
              ))}

            {tab === 'education' &&
              draft.education.map((x, i) => (
                <article key={x.id} className="editor-card">
                  {cardHeading('education', i, x.title, draft.education.length)}
                  <div className="form-grid">
                    <Field
                      label="Título"
                      value={x.title}
                      onChange={(v) => change((d) => void (d.education[i].title = v))}
                    />
                    <Field
                      label="Centro"
                      value={x.center}
                      onChange={(v) => change((d) => void (d.education[i].center = v))}
                    />
                    <Field
                      label="Ubicación"
                      value={x.location}
                      onChange={(v) => change((d) => void (d.education[i].location = v))}
                    />
                    <div className="form-pair">
                      <Field
                        label="Inicio"
                        value={x.start}
                        onChange={(v) => change((d) => void (d.education[i].start = v))}
                      />
                      <Field
                        label="Fin"
                        value={x.end}
                        onChange={(v) => change((d) => void (d.education[i].end = v))}
                      />
                    </div>
                  </div>
                </article>
              ))}

            {tab === 'entries' &&
              draft.entries.map((e, i) => (
                <article key={e.id} className="editor-card">
                  {cardHeading('entries', i, e.title, draft.entries.length, false)}
                  <div className="form-grid">
                    <Field
                      label="Título"
                      value={e.title}
                      onChange={(v) => change((d) => void (d.entries[i].title = v))}
                    />
                    <Field
                      label="Fecha"
                      type="date"
                      value={e.date}
                      onChange={(v) => change((d) => void (d.entries[i].date = v))}
                    />
                    <Field
                      label="Categoría"
                      value={e.category}
                      onChange={(v) => change((d) => void (d.entries[i].category = v))}
                    />
                  </div>
                  <Field
                    label="Texto"
                    value={e.text}
                    multiline
                    rows={10}
                    onChange={(v) => change((d) => void (d.entries[i].text = v))}
                  />
                </article>
              ))}

            {tab === 'skills' &&
              draft.skills.map((s, i) => (
                <article key={s.id} className="editor-card">
                  {cardHeading('skills', i, s.title, draft.skills.length)}
                  <div className="form-grid">
                    <Field
                      label="Grupo"
                      value={s.title}
                      onChange={(v) => change((d) => void (d.skills[i].title = v))}
                    />
                    <Field
                      label="Descripción"
                      value={s.description}
                      onChange={(v) => change((d) => void (d.skills[i].description = v))}
                    />
                    <ListField
                      label="Etiquetas (separadas por comas)"
                      value={s.tags}
                      onChange={(v) => change((d) => void (d.skills[i].tags = v))}
                    />
                  </div>
                </article>
              ))}

            {tab === 'metrics' &&
              draft.metrics.map((m, i) => (
                <article key={m.id} className="editor-card">
                  {cardHeading('metrics', i, m.value || `Cifra ${i + 1}`, draft.metrics.length)}
                  <div className="form-grid">
                    <Field
                      label="Cifra"
                      value={m.value}
                      onChange={(v) => change((d) => void (d.metrics[i].value = v))}
                    />
                    <Field
                      label="Contexto"
                      value={m.label}
                      onChange={(v) => change((d) => void (d.metrics[i].label = v))}
                    />
                  </div>
                </article>
              ))}
          </fieldset>
        </div>
        <p className="editor-footnote">
          {dirty ? 'Tienes cambios pendientes de guardar.' : 'Todo está al día.'}
        </p>
      </div>
    </div>
  );
}
