import { useState } from 'react';
import InventoryPage from './InventoryPage.jsx';

const tabs = ['Select events', 'Inventory management', 'Kitchen members'];

export default function CommunityKitchenPage({ kitchens, activeKitchenId, setActiveKitchenId, events, selections, inventory, memberships, onSelectEvent, onRemoveEvent, onAddInventory, onUpdateInventory, onAddMember }) {
  const [tab, setTab] = useState('Select events');
  const [memberId, setMemberId] = useState('member_3');
  const [memberRole, setMemberRole] = useState('member');
  const activeKitchen = kitchens.find((kitchen) => kitchen.id === activeKitchenId) || kitchens[0];
  const kitchenSelections = selections.filter((row) => row.kitchenId === activeKitchenId && row.status === 'selected');
  const kitchenMembers = memberships.filter((row) => row.kitchenId === activeKitchenId);

  if (!activeKitchen) {
    return <div className="page-content"><h1>Community Kitchen</h1><p>No kitchen memberships are linked to this user.</p></div>;
  }

  return (
    <div className="page-content">
      <h1>Community Kitchen</h1>
      <label className="kitchen-picker">Current kitchen
        <select value={activeKitchenId} onChange={(event) => setActiveKitchenId(event.target.value)}>
          {kitchens.map((kitchen) => <option key={kitchen.id} value={kitchen.id}>{kitchen.name}</option>)}
        </select>
      </label>
      <p>{activeKitchen.organizationId ? `Organization: ${activeKitchen.organizationId}` : 'This kitchen is independent.'}</p>

      <div className="role-tabs">
        {tabs.map((name) => <button key={name} className={tab === name ? 'tab-button active' : 'tab-button'} onClick={() => setTab(name)}>{name}</button>)}
      </div>

      {tab === 'Select events' && (
        <section className="content-section">
          <h2>Available events</h2>
          <p>Select events for this kitchen. Events are not automatically assigned a kitchen.</p>
          <div className="record-list">
            {events.map((event) => {
              const selected = kitchenSelections.some((row) => row.eventId === event.id);
              return (
                <div className="record" key={event.id}>
                  <h3>{event.title}</h3>
                  <p>Date: {event.date}</p>
                  <p>Location: {event.location}</p>
                  {selected
                    ? <button className="button button-light" onClick={() => onRemoveEvent(event.id)}>Remove selection</button>
                    : <button className="button" onClick={() => onSelectEvent(event.id)}>Select event</button>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {tab === 'Inventory management' && (
        <InventoryPage
          kitchenId={activeKitchenId}
          inventory={inventory.filter((item) => item.kitchenId === activeKitchenId)}
          onAddInventory={onAddInventory}
          onUpdateInventory={onUpdateInventory}
        />
      )}

      {tab === 'Kitchen members' && (
        <section className="content-section">
          <h2>Kitchen memberships</h2>
          <div className="record-list">
            {kitchenMembers.map((member) => (
              <div className="record" key={member.id}>
                <p>MealSync ID: {member.userId}</p>
                <p>Role: {member.role}</p>
                <p>Status: {member.status}</p>
              </div>
            ))}
          </div>
          <form className="member-form" onSubmit={(event) => { event.preventDefault(); onAddMember(memberId, memberRole); setMemberId(''); }}>
            <h3>Add member</h3>
            <label>MealSync ID <input value={memberId} onChange={(event) => setMemberId(event.target.value)} required /></label>
            <label>Kitchen role
              <select value={memberRole} onChange={(event) => setMemberRole(event.target.value)}>
                <option value="member">member</option>
                <option value="manager">manager</option>
              </select>
            </label>
            <button className="button" type="submit">Add member</button>
          </form>
        </section>
      )}
    </div>
  );
}
