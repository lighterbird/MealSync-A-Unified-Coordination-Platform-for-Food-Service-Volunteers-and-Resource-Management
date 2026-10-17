export const money = (value) => '₹' + Number(value || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
export const initials = (name = '') => String(name).split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
export const titleCase = (value = '') => String(value).replace(/-/g, ' ').replace(/\b\w/g, (character) => character.toUpperCase());
export const dateLabel = (value) => {
  if (!value) return 'Not set';
  const parsed = new Date(`${value}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};
export const timeLabel = (value = '') => {
  if (!value) return '';
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  return new Date(2000, 0, 1, hour, minute).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};
export const formatQuantity = (value) => Number(value).toLocaleString('en-IN', { maximumFractionDigits: 3 });
export const inputDateToday = () => new Date().toLocaleDateString('en-CA');

export function eventModalFields(event) {
  return [
    { name: 'title', label: 'Event title', value: event?.title || '', required: true, full: true },
    { name: 'category', label: 'Event category', type: 'select', value: event?.category || 'Meal service', options: ['Meal service', 'Meal preparation', 'Food packing', 'Food distribution', 'Community meal', 'Fundraiser', 'Other'], required: true },
    { name: 'place', label: 'Location', value: event?.place || '', required: true },
    { name: 'date', label: 'Date', type: 'date', value: event?.isoDate || inputDateToday(), required: true },
    { name: 'start24', label: 'Start time', type: 'time', value: event?.start24 || '09:00', required: true },
    { name: 'end24', label: 'End time', type: 'time', value: event?.end24 || '13:00', required: true },
    { name: 'needed', label: 'Volunteers required', type: 'number', value: String(event?.needed || 5), min: 1, required: true },
    { name: 'meals', label: 'Meals planned', type: 'number', value: String(event?.meals || 0), min: 0, required: true },
    { name: 'skillsText', label: 'Required skills (comma-separated)', value: event?.skills?.join(', ') || 'Food packing, Distribution', full: true },
    { name: 'description', label: 'Description', type: 'textarea', value: event?.description || '', full: true, required: true },
    { name: 'status', label: 'Listing status', type: 'select', value: event?.status || 'Published', options: ['Published', 'Draft'], required: true }
  ];
}
export function normalizeEvent(values, old = {}, id) {
  const skills = String(values.skillsText || '').split(',').map((item) => item.trim()).filter(Boolean);
  return {
    ...old, id, title: values.title.trim(), org: old.org || 'MealSync demo organizer', category: values.category,
    place: values.place.trim(), date: new Date(`${values.date}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short' }).replace(/^(\w+), 0(\d)/, '$1, $2'), isoDate: values.date,
    start24: values.start24, end24: values.end24, start: timeLabel(values.start24), end: timeLabel(values.end24),
    needed: Number(values.needed), meals: Number(values.meals), skills, volunteers: old.volunteers || 0,
    icon: old.icon || '🥘', tone: old.tone || 'green', score: old.score || 80, status: values.status,
    description: values.description.trim()
  };
}
