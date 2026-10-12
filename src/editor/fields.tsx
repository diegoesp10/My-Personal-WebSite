import { useEffect, useId, useState } from 'react';

export function Field({
  label,
  value,
  onChange,
  multiline = false,
  rows = 4,
  type = 'text',
  hint = '',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  rows?: number;
  type?: string;
  hint?: string;
}) {
  const hintId = useId();
  return (
    <label className={`form-field${multiline ? ' is-wide' : ''}`}>
      <span>{label}</span>
      {multiline ? (
        <textarea
          value={value}
          rows={rows}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type={type}
          value={value}
          aria-describedby={hint ? hintId : undefined}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
      {hint && <small id={hintId}>{hint}</small>}
    </label>
  );
}

const parse = (text: string, lines: boolean) =>
  text
    .split(lines ? /\n/ : /,/)
    .map((item) => item.trim())
    .filter(Boolean);

const same = (a: string[], b: string[]) =>
  a.length === b.length && a.every((item, i) => item === b[i]);

/**
 * Edits a list as text (comma separated or one item per line). The text is kept locally so spaces and
 * separators can be typed freely; the list sent upwards is always trimmed and without empty items.
 */
export function ListField({
  label,
  value,
  onChange,
  lines = false,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  lines?: boolean;
}) {
  const join = (items: string[]) => items.join(lines ? '\n' : ', ');
  const [text, setText] = useState(() => join(value));

  useEffect(() => {
    setText((current) => (same(parse(current, lines), value) ? current : join(value)));
  }, [value, lines]);

  return (
    <label className={`form-field${lines ? ' is-wide' : ''}`}>
      <span>{label}</span>
      {lines ? (
        <textarea
          value={text}
          rows={Math.max(4, value.length + 1)}
          onChange={(e) => {
            setText(e.target.value);
            onChange(parse(e.target.value, true));
          }}
        />
      ) : (
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onChange(parse(e.target.value, false));
          }}
          onBlur={() => setText(join(value))}
        />
      )}
    </label>
  );
}
