import type { ProjectSection } from '../lib/types';
import { Field } from './fields';

export function ProjectSectionsEditor({
  sections,
  onChange,
}: {
  sections: ProjectSection[];
  onChange: (sections: ProjectSection[]) => void;
}) {
  const update = (index: number, field: keyof ProjectSection, value: string) =>
    onChange(
      sections.map((section, current) =>
        current === index ? { ...section, [field]: value } : section,
      ),
    );
  return (
    <div className="project-sections-editor is-wide">
      <h3>Detalle técnico por apartados</h3>
      {sections.map((section, index) => (
        <div key={index} className="project-section-fields">
          <Field
            label={`Título del apartado ${index + 1}`}
            value={section.title}
            onChange={(value) => update(index, 'title', value)}
          />
          <Field
            label="Descripción"
            value={section.text}
            multiline
            onChange={(value) => update(index, 'text', value)}
          />
          <div className="page-actions">
            <button
              type="button"
              className="button button-ghost"
              disabled={index === 0}
              onClick={() => {
                const reordered = [...sections];
                [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
                onChange(reordered);
              }}
            >
              Subir apartado
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => onChange(sections.filter((_, current) => current !== index))}
            >
              Eliminar apartado {index + 1}
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="button button-ghost"
        disabled={sections.length >= 20}
        onClick={() => onChange([...sections, { title: 'Nuevo apartado', text: '' }])}
      >
        Añadir apartado
      </button>
    </div>
  );
}
