// Descriptive demand, surplus and wastage reporting.
// DEMO DATA BOUNDARY: reads/writes use AppContext's in-memory seeded records. Replace these calls with the agreed Flask API; see docs/FRONTEND_TASKS_BY_PERSON.md.
import { useMemo } from 'react';
import Button from '../components/Button';
import { DemoBanner, MetricCard, PageHeading, Pill, SectionCard, SimpleTable } from '../components/Shared';
import { useMealSync } from '../context/AppContext';
import { dateLabel, inputDateToday } from '../components/helpers';

export default function AnalyticsPage() {
  const { data, addItem, updateData, addActivity, showToast, openModal } = useMealSync();
  const totalEstimated = data.demands.reduce((sum, item) => sum + Number(item.estimated || 0), 0);
  const totalActual = data.demands.reduce((sum, item) => sum + Number(item.actual || 0), 0);
  const avgDifference = data.demands.length ? Math.round((totalActual - totalEstimated) / data.demands.length) : 0;
  const max = Math.max(1, ...data.demands.flatMap((item) => [item.estimated || 0, item.actual || 0]));
  const addDemand = () => openModal({ title: 'Record daily meal demand', subtitle: 'Store the manual estimate and the actual output when known.', fields: [
    { name: 'date', label: 'Date', type: 'date', value: inputDateToday(), required: true },
    { name: 'estimated', label: 'Estimated servings', type: 'number', value: '450', min: 0, required: true },
    { name: 'actual', label: 'Actual servings (optional)', type: 'number', value: '', min: 0, required: false }
  ], onSubmit: (values) => {
    const item = { date: values.date, estimated: Number(values.estimated), actual: values.actual === '' ? null : Number(values.actual) };
    updateData((previous) => ({ ...previous, demands: previous.demands.some((entry) => entry.date === item.date) ? previous.demands.map((entry) => entry.date === item.date ? item : entry) : [...previous.demands, item].sort((a, b) => a.date.localeCompare(b.date)) }));
    addActivity(`Recorded meal demand for ${values.date}: ${item.estimated} estimated servings`); showToast('Demand record saved');
  }});
  const logWaste = () => openModal({ title: 'Log food wastage', subtitle: 'Record discarded food or ingredients with a reason.', fields: [
    { name: 'date', label: 'Date', type: 'date', value: inputDateToday(), required: true },
    { name: 'item', label: 'Ingredient or prepared meal', value: 'Tomatoes', required: true },
    { name: 'quantity', label: 'Quantity (include unit)', value: '1 kg', required: true },
    { name: 'reason', label: 'Reason', type: 'select', value: 'Preparation waste', options: ['Spoilage', 'Overproduction', 'Damaged', 'Preparation waste', 'Other'], required: true }
  ], onSubmit: (values) => { addItem('wastage', { date: dateLabel(values.date), item: values.item, quantity: values.quantity, reason: values.reason }); addActivity(`Wastage logged: ${values.item} (${values.quantity})`); showToast('Wastage recorded', 'Reason and quantity saved to demo state.'); }});
  const logSurplus = () => openModal({ title: 'Log meal surplus', subtitle: 'Record safe surplus meals and what happened to them.', fields: [
    { name: 'date', label: 'Date', type: 'date', value: inputDateToday(), required: true },
    { name: 'recipe', label: 'Prepared meal / recipe', type: 'select', value: data.recipes[0]?.name || '', options: data.recipes.map((recipe) => recipe.name), required: true },
    { name: 'servings', label: 'Surplus servings', type: 'number', value: '10', min: 1, required: true },
    { name: 'action', label: 'What happened to the surplus?', type: 'select', value: 'Shared with shelter', options: ['Shared with shelter', 'Distributed to volunteers', 'Refrigerated safely', 'Other'], required: true }
  ], onSubmit: (values) => { addItem('surplus', { date: dateLabel(values.date), recipe: values.recipe, servings: Number(values.servings), action: values.action }); addActivity(`Surplus logged: ${values.recipe} (${values.servings} servings)`); showToast('Surplus recorded'); }});
  const recentDemands = useMemo(() => [...data.demands].sort((a, b) => b.date.localeCompare(a.date)), [data.demands]);
  return <><DemoBanner/><PageHeading title="Kitchen analytics" subtitle="Track demand, actual output, surplus and wastage. This is descriptive reporting, not an ML forecast." actions={<><Button onClick={logSurplus}>＋ Log surplus</Button><Button variant="primary" onClick={addDemand}>＋ Record daily demand</Button></>}/>
    <div className="grid-4" style={{ marginBottom: 18 }}><MetricCard icon="◷" label="Estimated servings" value={totalEstimated.toLocaleString('en-IN')} foot={`${data.demands.length} demo days`}/><MetricCard icon="🍱" label="Actual servings" value={totalActual.toLocaleString('en-IN')} foot="Recorded output" tone="blue"/><MetricCard icon="↗" label="Avg. actual − estimate" value={`${avgDifference > 0 ? '+' : ''}${avgDifference}`} foot="Servings per day" tone="purple"/><MetricCard icon="♻" label="Surplus logged" value={data.surplus.reduce((sum, item) => sum + Number(item.servings || 0), 0)} foot="Known surplus servings" tone="orange"/></div>
    <div className="layout-grid"><div className="stack"><SectionCard title="Demand vs actual meals" subtitle="Compare the manual estimate with recorded service output."><div className="simple-chart">{data.demands.slice(-7).map((item) => <div className="simple-chart-column" key={item.date}><div className="simple-chart-bar" style={{ height: `${Math.max(1, item.estimated / max * 100)}%` }} title={`Estimated ${item.estimated}`}/>{item.actual !== null && item.actual !== undefined && <div className="simple-chart-bar actual" style={{ height: `${Math.max(1, item.actual / max * 100)}%` }} title={`Actual ${item.actual}`}/>}<span className="simple-chart-label">{item.date.slice(8)} {new Date(`${item.date}T12:00:00`).toLocaleDateString('en-IN', { month: 'short' })}</span></div>)}</div><div className="legend" style={{ marginTop: 30 }}><span><i/> Estimated servings</span><span><i className="secondary"/> Actual servings</span></div><p className="muted tiny" style={{ margin: '14px 0 0' }}>Sample insight: actual counts vary around the estimate. A predictive model would require enough trustworthy historical data; this visual is not an ML forecast.</p></SectionCard>
    <SectionCard title="Recent wastage log" subtitle="Capture item, quantity and a reason for analysis." actions={<Button size="sm" onClick={logWaste}>＋ Log wastage</Button>}><SimpleTable columns={[{ key: 'date', label: 'Date' }, { key: 'item', label: 'Item' }, { key: 'quantity', label: 'Quantity' }, { key: 'reason', label: 'Reason', render: (item) => <Pill tone="amber">{item.reason}</Pill> }]} rows={data.wastage}/></SectionCard>
    <SectionCard title="Daily demand history" subtitle="Estimates and actual output should remain separate records."><SimpleTable columns={[{ key: 'date', label: 'Date', render: (item) => dateLabel(item.date) }, { key: 'estimated', label: 'Estimated servings' }, { key: 'actual', label: 'Actual servings', render: (item) => item.actual === null || item.actual === undefined ? <span className="muted">Not recorded</span> : item.actual }, { key: 'difference', label: 'Difference', render: (item) => item.actual === null || item.actual === undefined ? '—' : <Pill tone={item.actual > item.estimated ? 'orange' : 'green'}>{item.actual - item.estimated > 0 ? '+' : ''}{item.actual - item.estimated}</Pill> }]} rows={recentDemands}/></SectionCard></div>
    <div className="stack"><SectionCard title="Surplus recovery" subtitle="Meals left after service" actions={<Button size="sm" onClick={logSurplus}>Log surplus ↗</Button>}>{data.surplus.map((item, index) => <div className="list-row" key={`${item.date}-${index}`}><span className="avatar green">♻</span><div className="grow"><strong>{item.recipe}</strong><small>{item.date} · {item.action}</small></div><Pill tone="green">{item.servings} meals</Pill></div>)}</SectionCard><SectionCard title="Where to focus next" subtitle="Simple rules from current demo data"><div className="list-row"><span className="avatar orange">⚠</span><div className="grow"><strong>Restock below-threshold ingredients</strong><small>{data.inventory.filter((item) => item.quantity < item.threshold).map((item) => item.ingredient).join(', ') || 'No current low-stock alerts'}.</small></div></div><div className="list-row"><span className="avatar blue">▤</span><div className="grow"><strong>Record actual demand daily</strong><small>Consistent history is the foundation for better estimates.</small></div></div><div className="list-row"><span className="avatar purple">♨</span><div className="grow"><strong>Compare recipe plans to output</strong><small>Keep planned and actual servings in separate fields.</small></div></div></SectionCard></div></div>
  </>;
}
