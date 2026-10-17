import { useState } from 'react';

export default function InventoryPage({ kitchenId, inventory, onAddInventory, onUpdateInventory }) {
  const [ingredient, setIngredient] = useState('ingredient_4');
  const [quantity, setQuantity] = useState('0');
  const [unit, setUnit] = useState('unit_1');
  const [editingId, setEditingId] = useState(null);
  const [editingQuantity, setEditingQuantity] = useState('');

  function submitNewItem(event) {
    event.preventDefault();
    onAddInventory({ ingredient, quantity, unit, kitchenId });
    setIngredient(`ingredient_${inventory.length + 2}`);
    setQuantity('0');
  }

  function saveQuantity(itemId) {
    onUpdateInventory(itemId, { quantity: Number(editingQuantity) || 0 });
    setEditingId(null);
  }

  return (
    <section className="content-section">
      <h2>Inventory management</h2>
      <p>Add an item or change its quantity.</p>

      <form className="inventory-add-form" onSubmit={submitNewItem}>
        <label>Ingredient <input value={ingredient} onChange={(event) => setIngredient(event.target.value)} required /></label>
        <label>Quantity <input type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></label>
        <label>Unit <input value={unit} onChange={(event) => setUnit(event.target.value)} required /></label>
        <button className="button" type="submit">Add item</button>
      </form>

      <table className="simple-table">
        <thead><tr><th>Ingredient</th><th>Quantity</th><th>Unit</th><th>Action</th></tr></thead>
        <tbody>
          {inventory.map((item) => (
            <tr key={item.id}>
              <td>{item.ingredient}</td>
              <td>
                {editingId === item.id
                  ? <input className="table-input" type="number" value={editingQuantity} onChange={(event) => setEditingQuantity(event.target.value)} />
                  : item.quantity}
              </td>
              <td>{item.unit}</td>
              <td>
                {editingId === item.id
                  ? <button className="button" onClick={() => saveQuantity(item.id)}>Save</button>
                  : <button className="button button-light" onClick={() => { setEditingId(item.id); setEditingQuantity(String(item.quantity)); }}>Edit</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
