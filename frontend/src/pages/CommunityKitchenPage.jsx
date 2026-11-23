import { useState, useEffect } from 'react';
import IndiaLocationFields from '../components/IndiaLocationFields';

export default function CommunityKitchenPage({ user }) {
  const [kitchens, setKitchens] = useState([]);
  const [selectedKitchen, setSelectedKitchen] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchKitchens(); }, []);

  const fetchKitchens = async () => {
    try {
      const res = await fetch(`/api/kitchens?mealsync_id=${user.mealsync_id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setKitchens(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page">Loading...</div>;

  if (selectedKitchen) {
    return <InsideKitchen kitchen={selectedKitchen} onBack={() => setSelectedKitchen(null)} />;
  }

  return (
    <div className="page">
      <h1>Community Kitchen Dashboard</h1>
      <p>Select a kitchen to manage, or create a new one.</p>
      {error && <p className="error">{error}</p>}
      <div className="org-grid">
        {kitchens.map(k => (
          <KitchenCard key={k.kitchen_id} kitchen={k} onSelect={() => setSelectedKitchen(k)} onRefresh={fetchKitchens} />
        ))}
        <NewKitchenCard userId={user.mealsync_id} onCreated={fetchKitchens} />
      </div>
    </div>
  );
}

function KitchenCard({ kitchen, onSelect, onRefresh }) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(kitchen.name);
  const [desc, setDesc] = useState(kitchen.description);
  const [location, setLocation] = useState({ city: kitchen.city, state: kitchen.state });

  const handleUpdate = async (event) => {
    event.preventDefault();
    await fetch(`/api/kitchens/${kitchen.kitchen_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, ...location })
    });
    setIsEditing(false);
    onRefresh();
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this kitchen? All inventory and recipes will be lost.")) return;
    await fetch(`/api/kitchens/${kitchen.kitchen_id}`, { method: 'DELETE' });
    onRefresh();
  };

  if (isEditing) {
    return (
      <form className="card stack-form" onSubmit={handleUpdate}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
        <IndiaLocationFields {...location} onChange={setLocation} required />
        <button type="submit" className="button primary">Save</button>
        <button type="button" onClick={() => setIsEditing(false)} className="button secondary">Cancel</button>
      </form>
    );
  }

  return (
    <div className="card">
      <h3>{kitchen.name}</h3>
      <p>{kitchen.description || "No description"}</p>
      <p>{kitchen.city}, {kitchen.state}</p>
      <div className="card-actions">
        <button onClick={onSelect} className="button primary">Enter</button>
        <button onClick={() => setIsEditing(true)} className="button secondary">Edit</button>
        <button onClick={handleDelete} className="button danger">Delete</button>
      </div>
    </div>
  );
}

function NewKitchenCard({ userId, onCreated }) {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [location, setLocation] = useState({ city: '', state: '' });

  const handleCreate = async (event) => {
    event.preventDefault();
    await fetch('/api/kitchens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_mealsync_id: userId, name, description: desc, ...location })
    });
    setIsCreating(false);
    onCreated();
  };

  if (isCreating) {
    return (
      <form className="card stack-form" onSubmit={handleCreate}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Kitchen Name" />
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Description" />
        <IndiaLocationFields {...location} onChange={setLocation} required />
        <button type="submit" className="button primary">Create</button>
        <button type="button" onClick={() => setIsCreating(false)} className="button secondary">Cancel</button>
      </form>
    );
  }

  return (
    <div className="card new-card" onClick={() => setIsCreating(true)}>
      <h3>+ Create New Kitchen</h3>
    </div>
  );
}

function InsideKitchen({ kitchen, onBack }) {
  const [view, setView] = useState('menu');
  const [expectedServings, setExpectedServings] = useState(null);
  const [servingsError, setServingsError] = useState('');

  useEffect(() => {
    if (view !== 'menu') return;
    const controller = new AbortController();
    fetch(`/api/kitchens/${kitchen.kitchen_id}/expected-servings`, { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error('Could not calculate current servings.');
        const data = await response.json();
        if (!controller.signal.aborted) {
          setExpectedServings(data.expected_servings);
          setServingsError('');
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setServingsError('Could not calculate current servings.');
      });
    return () => controller.abort();
  }, [kitchen.kitchen_id, view]);

  if (view === 'menu') {
    return (
      <div className="page">
        <button onClick={onBack} className="button secondary" style={{ marginBottom: '20px' }}>&larr; Back to Kitchens</button>
        <h1>{kitchen.name}</h1>
        <p>{kitchen.description}</p>
        {servingsError ? <p className="error" role="alert">{servingsError}</p> : (
          <p><strong>Current serving capacity:</strong> {expectedServings ?? 'Calculating…'}</p>
        )}
        <div className="card-actions" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <button onClick={() => setView('all-events')} className="button primary">All Events</button>
          <button onClick={() => setView('events-for-you')} className="button primary">Events for You</button>
          <button onClick={() => setView('your-events')} className="button primary">Your Events</button>
          <button onClick={() => setView('inventory')} className="button primary">Inventory</button>
          <button onClick={() => setView('recipes')} className="button primary">Recipes</button>
        </div>
      </div>
    );
  }

  if (view === 'all-events' || view === 'events-for-you') {
    return <KitchenEvents key={view} kitchenId={kitchen.kitchen_id} matchedOnly={view === 'events-for-you'}
      onBack={() => setView('menu')} />;
  }
  if (view === 'your-events') return <YourEvents kitchen={kitchen} onBack={() => setView('menu')} />;
  if (view === 'inventory') return <InventoryTab kitchen={kitchen} onBack={() => setView('menu')} />;
  if (view === 'recipes') return <RecipesTab kitchen={kitchen} onBack={() => setView('menu')} />;
}

function KitchenEvents({ kitchenId, matchedOnly, onBack }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const endpoint = matchedOnly ? 'events-for-you' : 'all-events';

  useEffect(() => {
    fetch(`/api/kitchens/${kitchenId}/${endpoint}`)
      .then(async response => {
        if (!response.ok) throw new Error('Could not load events.');
        setEvents(await response.json());
      })
      .catch(err => setError(err.message));
  }, [kitchenId, endpoint]);

  const handleApply = async (eventId) => {
    setError('');
    setApplying(true);
    try {
      const response = await fetch(`/api/kitchens/${kitchenId}/apply/${eventId}`, { method: 'POST' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not apply to the event.');
      setEvents(current => matchedOnly
        ? current.filter(event => event.event_id !== eventId)
        : current.map(event => event.event_id === eventId ? { ...event, already_applied: true } : event));
    } catch (err) {
      setError(err.message);
    } finally {
      setApplying(false);
    }
  };

  const filtered = events.filter(e =>
    e.org_name.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase()) ||
    e.state.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>{matchedOnly ? 'Events for You' : 'All Proposed Events'}</h2>
      {error && <p className="error" role="alert">{error}</p>}
      {!matchedOnly && <input placeholder="Search by org, city, state..." value={search}
        onChange={e => setSearch(e.target.value)} style={{ marginBottom: '20px', padding: '8px', width: '100%' }} />}
      {!error && filtered.length === 0 && <p>{matchedOnly ? 'No matching events.' : 'No events found.'}</p>}
      {filtered.map(e => (
        <div key={e.event_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>{e.city}, {e.state} on {e.event_date} | Expected: {e.expected_people}</p>
          {!e.already_applied && (
            <button disabled={applying} onClick={() => handleApply(e.event_id)} className="button primary">Apply</button>
          )}
          {e.already_applied && <span style={{ color: 'green' }}>Already Applied</span>}
        </div>
      ))}
    </div>
  );
}

function YourEvents({ kitchen, onBack }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch(`/api/kitchens/${kitchen.kitchen_id}/your-events`)
      .then(r => r.json())
      .then(d => setEvents(d));
  }, [kitchen]);

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Your Events</h2>
      {events.length === 0 ? <p>No events yet.</p> : events.map(e => (
        <div key={e.event_id} className="card">
          <h3>{e.event_id} | {e.org_name}</h3>
          <p>{e.city}, {e.state} on {e.event_date} | Expected: {e.expected_people}</p>
          <div className="card-actions">
            {e.tags.map(t => <span key={t} className={`status-badge ${t}`}>{t.toUpperCase()}</span>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function InventoryTab({ kitchen, onBack }) {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ item_name: '', quantity: '', unit: 'units' });
  const [editingId, setEditingId] = useState(null);
  const [saveError, setSaveError] = useState('');

  useEffect(() => { fetchItems(); }, [kitchen]);

  const fetchItems = async () => {
    const res = await fetch(`/api/kitchens/${kitchen.kitchen_id}/inventory`);
    setItems(await res.json());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    const url = editingId
      ? `/api/kitchens/inventory/${editingId}`
      : `/api/kitchens/${kitchen.kitchen_id}/inventory`;
    try {
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not save the item.');
      }
      setForm({ item_name: '', quantity: '', unit: 'units' });
      setEditingId(null);
      await fetchItems();
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const handleEdit = (item) => {
    setSaveError('');
    setEditingId(item.item_id);
    setForm({ item_name: item.item_name, quantity: item.quantity, unit: item.unit });
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("Delete this item?")) return;
    await fetch(`/api/kitchens/inventory/${itemId}`, { method: 'DELETE' });
    fetchItems();
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Inventory</h2>
      {saveError && <p className="error" role="alert">{saveError}</p>}
      <form onSubmit={handleSubmit} className="stack-form" style={{ marginBottom: '20px' }}>
        <input required placeholder="Item name" value={form.item_name} onChange={e => setForm({...form, item_name: e.target.value})} />
        <input required type="number" step="0.01" placeholder="Quantity" value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} />
        <input required placeholder="Unit" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
        <button type="submit" className="button primary">{editingId ? 'Update' : 'Add Item'}</button>
        {editingId && <button type="button" className="button secondary" onClick={() => { setEditingId(null); setForm({ item_name: '', quantity: '', unit: 'units' }); }}>Cancel</button>}
      </form>
      {items.map(i => (
        <div key={i.item_id} className="card">
          <h3>{i.item_name}</h3>
          <p>{i.quantity} {i.unit}</p>
          <div className="card-actions">
            <button onClick={() => handleEdit(i)} className="button secondary">Edit</button>
            <button onClick={() => handleDelete(i.item_id)} className="button danger">Delete</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecipesTab({ kitchen, onBack }) {
  const [recipes, setRecipes] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState([{ item_id: '', quantity_per_serving: '' }]);
  const [saveError, setSaveError] = useState('');

  useEffect(() => {
    fetch(`/api/kitchens/${kitchen.kitchen_id}/recipes`).then(r => r.json()).then(setRecipes);
    fetch(`/api/kitchens/${kitchen.kitchen_id}/inventory`).then(r => r.json()).then(setInventory);
  }, [kitchen]);

  const addIngRow = () => setIngredients([...ingredients, { item_id: '', quantity_per_serving: '' }]);
  const removeIngRow = (idx) => setIngredients(ingredients.filter((_, i) => i !== idx));
  const updateIng = (idx, field, val) => {
    const copy = [...ingredients];
    copy[idx][field] = val;
    setIngredients(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');
    const url = `/api/kitchens/${kitchen.kitchen_id}/recipes`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipe_name: name, ingredients })
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Could not save the recipe.');
      }
      setName('');
      setIngredients([{ item_id: '', quantity_per_serving: '' }]);
      const recipesResponse = await fetch(url);
      if (!recipesResponse.ok) throw new Error('Could not refresh recipes.');
      setRecipes(await recipesResponse.json());
    } catch (err) {
      setSaveError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this recipe?")) return;
    await fetch(`/api/kitchens/recipes/${id}`, { method: 'DELETE' });
    fetch(`/api/kitchens/${kitchen.kitchen_id}/recipes`).then(r => r.json()).then(setRecipes);
  };

  return (
    <div className="page">
      <button onClick={onBack} className="button secondary">&larr; Back</button>
      <h2>Recipes</h2>
      {saveError && <p className="error" role="alert">{saveError}</p>}
      <form onSubmit={handleSubmit} className="stack-form" style={{ marginBottom: '20px' }}>
        <input required placeholder="Recipe name" value={name} onChange={e => setName(e.target.value)} />
        {ingredients.map((ing, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '5px' }}>
            <select value={ing.item_id} onChange={e => updateIng(idx, 'item_id', e.target.value)} required>
              <option value="">Select item</option>
              {inventory.map(i => <option key={i.item_id} value={i.item_id}>{i.item_name}</option>)}
            </select>
            <input type="number" step="0.01" placeholder="Qty per serving" value={ing.quantity_per_serving} onChange={e => updateIng(idx, 'quantity_per_serving', e.target.value)} required />
            <button type="button" onClick={() => removeIngRow(idx)} className="button danger">X</button>
          </div>
        ))}
        <button type="button" onClick={addIngRow} className="button secondary">+ Add Ingredient</button>
        <button type="submit" className="button primary">Create Recipe</button>
      </form>
      {recipes.map(r => (
        <div key={r.recipe_id} className="card">
          <h3>{r.recipe_name}</h3>
          <ul>
            {r.ingredients.map(ing => (
              <li key={ing.item_id}>{ing.item_name}: {ing.quantity_per_serving} units per serving</li>
            ))}
          </ul>
          <button onClick={() => handleDelete(r.recipe_id)} className="button danger">Delete</button>
        </div>
      ))}
    </div>
  );
}
