import { useEffect, useState } from 'react';
import Button from './Button';

function initialValues(fields = []) {
  return Object.fromEntries(fields.map((field) => [field.name, field.value ?? (field.type === 'checkbox' ? false : field.type === 'multiselect' ? [] : '')]));
}

export default function ModalHost({ modal, closeModal }) {
  const [values, setValues] = useState(() => initialValues(modal?.fields));
  useEffect(() => setValues(initialValues(modal?.fields)), [modal]);
  useEffect(() => {
    if (!modal || modal.dismissible === false) return undefined;
    const onKey = (event) => { if (event.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modal, closeModal]);
  if (!modal) return null;
  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));
  const optionsFor = (field) => (field.options || []).map((option) => typeof option === 'string' ? { label: option, value: option } : option);
  const submit = (event) => {
    event.preventDefault();
    const missing = (modal.fields || []).find((field) => field.required && (values[field.name] === '' || values[field.name] === undefined || values[field.name] === null || (Array.isArray(values[field.name]) && !values[field.name].length)));
    if (missing) { document.getElementById(`modal-field-${missing.name}`)?.focus(); return; }
    const outcome = modal.onSubmit?.(values);
    if (outcome !== false && !modal.keepOpen) closeModal();
  };
  const body = modal.message && <p className="modal-message">{modal.message}</p>;
  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget && modal.dismissible !== false) closeModal(); }}>
    <section className={`modal ${modal.wide ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={modal.title}>
      <header className="modal-head"><div><h2>{modal.title}</h2>{modal.subtitle && <p>{modal.subtitle}</p>}</div><button type="button" className="modal-close" onClick={closeModal} aria-label="Close dialog">×</button></header>
      <form onSubmit={submit}>
        <div className="modal-body">{body}{modal.content}{(modal.fields?.length > 0) && <div className="form-grid">{modal.fields.map((field) => <div key={field.name} className={`field ${field.full ? 'full' : ''}`}>
          {field.type !== 'checkbox' && <label htmlFor={`modal-field-${field.name}`}>{field.label}{field.required && <span aria-hidden="true"> *</span>}</label>}
          {field.type === 'textarea' ? <textarea id={`modal-field-${field.name}`} name={field.name} required={field.required} placeholder={field.placeholder || ''} value={values[field.name] ?? ''} onChange={(event) => update(field.name, event.target.value)} />
            : field.type === 'select' ? <select id={`modal-field-${field.name}`} name={field.name} required={field.required} value={values[field.name] ?? ''} onChange={(event) => update(field.name, event.target.value)}><option value="">{field.placeholder || 'Choose an option'}</option>{optionsFor(field).map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}</select>
            : field.type === 'multiselect' ? <select id={`modal-field-${field.name}`} name={field.name} multiple value={values[field.name] || []} onChange={(event) => update(field.name, Array.from(event.target.selectedOptions).map((option) => option.value))}>{optionsFor(field).map((option) => <option key={String(option.value)} value={option.value}>{option.label}</option>)}</select>
            : field.type === 'checkbox' ? <label className="check-option" htmlFor={`modal-field-${field.name}`}><input id={`modal-field-${field.name}`} type="checkbox" checked={Boolean(values[field.name])} onChange={(event) => update(field.name, event.target.checked)} /><span><strong>{field.label}</strong>{field.hint && <span>{field.hint}</span>}</span></label>
            : <input id={`modal-field-${field.name}`} name={field.name} type={field.type || 'text'} required={field.required} min={field.min} max={field.max} step={field.step} placeholder={field.placeholder || ''} value={values[field.name] ?? ''} onChange={(event) => update(field.name, field.type === 'number' ? event.target.value : event.target.value)} />}
          {field.hint && field.type !== 'checkbox' && <span className="hint">{field.hint}</span>}
        </div>)}</div>}
        </div>
        <footer className="modal-foot"><Button onClick={closeModal}>{modal.cancelLabel || 'Cancel'}</Button><Button variant="primary" type="submit">{modal.submitLabel || 'Done'}</Button></footer>
      </form>
    </section>
  </div>;
}
