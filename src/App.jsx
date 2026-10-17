import { useState } from 'react';
import { demoData } from './data/demoData.js';
import CommunityKitchenPage from './pages/CommunityKitchenPage.jsx';

export default function App() {
  const [data, setData] = useState(() =>
    JSON.parse(JSON.stringify(demoData))
  );

  const [activeKitchenId, setActiveKitchenId] = useState('kitchen_1');

  function updateList(listName, newList) {
    setData((oldData) => ({
      ...oldData,
      [listName]: newList
    }));
  }

  function addRecord(listName, record) {
    updateList(listName, [...data[listName], record]);
  }

  function updateRecord(listName, recordId, changes) {
    updateList(
      listName,
      data[listName].map((row) =>
        row.id === recordId ? { ...row, ...changes } : row
      )
    );
  }

  function selectEventForKitchen(eventId) {
    const existing = data.kitchenEventSelections.find(
      (row) =>
        row.kitchenId === activeKitchenId &&
        row.eventId === eventId
    );

    if (existing && existing.status === 'selected') {
      return;
    }

    if (existing) {
      updateRecord('kitchenEventSelections', existing.id, {
        status: 'selected'
      });
      return;
    }

    addRecord('kitchenEventSelections', {
      id: `kitchen_event_${data.kitchenEventSelections.length + 1}`,
      kitchenId: activeKitchenId,
      eventId,
      selectedByUserId: 'user',
      status: 'selected'
    });
  }

  function removeKitchenEvent(eventId) {
    const existing = data.kitchenEventSelections.find(
      (row) =>
        row.kitchenId === activeKitchenId &&
        row.eventId === eventId &&
        row.status === 'selected'
    );

    if (existing) {
      updateRecord('kitchenEventSelections', existing.id, {
        status: 'withdrawn'
      });
    }
  }

  function addInventoryItem(values) {
    const id = `inventory_${data.inventory.length + 1}`;

    addRecord('inventory', {
      id,
      kitchenId: activeKitchenId,
      ingredient: values.ingredient || id,
      quantity: Number(values.quantity) || 0,
      unit: values.unit || 'unit_1'
    });
  }

  function addKitchenMember(userId, memberRole) {
    const alreadyMember = data.kitchenMemberships.some(
      (row) =>
        row.kitchenId === activeKitchenId &&
        row.userId === userId.trim()
    );

    if (alreadyMember || !userId.trim()) {
      return;
    }

    addRecord('kitchenMemberships', {
      id: `membership_${data.kitchenMemberships.length + 1}`,
      kitchenId: activeKitchenId,
      userId: userId.trim(),
      role: memberRole || 'member',
      status: 'active'
    });
  }

  const kitchens = data.kitchens.filter((kitchen) =>
    data.kitchenMemberships.some(
      (member) =>
        member.kitchenId === kitchen.id &&
        member.userId === 'user'
    )
  );

  return (
    <CommunityKitchenPage
      kitchens={kitchens}
      activeKitchenId={activeKitchenId}
      setActiveKitchenId={setActiveKitchenId}
      events={data.events}
      selections={data.kitchenEventSelections}
      inventory={data.inventory}
      memberships={data.kitchenMemberships}
      onSelectEvent={selectEventForKitchen}
      onRemoveEvent={removeKitchenEvent}
      onAddInventory={addInventoryItem}
      onUpdateInventory={(itemId, changes) =>
        updateRecord('inventory', itemId, changes)
      }
      onAddMember={addKitchenMember}
    />
  );
}
