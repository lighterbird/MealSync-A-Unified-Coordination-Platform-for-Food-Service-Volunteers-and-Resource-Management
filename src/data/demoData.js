export const roleNames = [
  'Volunteer',
  'Donor',
  'Organization',
  'Community Kitchen'
];

export const demoData = {
  events: [
    {
      id: 'event_1',
      title: 'event_1',
      date: '2026-10-20',
      location: 'location_1',
      volunteersRequired: 2,
      organizationId: 'organization_1',
      status: 'Open'
    },
    {
      id: 'event_2',
      title: 'event_2',
      date: '2026-10-22',
      location: 'location_2',
      volunteersRequired: 3,
      organizationId: 'organization_1',
      status: 'Open'
    }
  ],
  kitchens: [
    { id: 'kitchen_1', name: 'kitchen_1', organizationId: 'organization_1', location: 'location_1' },
    { id: 'kitchen_2', name: 'kitchen_2', organizationId: null, location: 'location_2' }
  ],
  organizations: [
    { id: 'organization_1', name: 'organization_1', location: 'location_1' },
    { id: 'organization_2', name: 'organization_2', location: 'location_2' }
  ],
  inventory: [
    { id: 'inventory_1', kitchenId: 'kitchen_1', ingredient: 'ingredient_1', quantity: 10, unit: 'unit_1' },
    { id: 'inventory_2', kitchenId: 'kitchen_1', ingredient: 'ingredient_2', quantity: 20, unit: 'unit_1' },
    { id: 'inventory_3', kitchenId: 'kitchen_1', ingredient: 'ingredient_3', quantity: 5, unit: 'unit_2' },
    { id: 'inventory_4', kitchenId: 'kitchen_2', ingredient: 'ingredient_1', quantity: 8, unit: 'unit_1' }
  ],
  donationRequests: [
    { id: 'request_1', eventId: 'event_1', title: 'request_1', donationType: 'FOOD', targetQuantity: 10, unit: 'unit_1' },
    { id: 'request_2', eventId: 'event_2', title: 'request_2', donationType: 'MONEY', targetQuantity: null, unit: null }
  ],
  donations: [],
  registrations: [],
  referrals: [],
  kitchenMemberships: [
    { id: 'membership_1', kitchenId: 'kitchen_1', userId: 'user', role: 'manager', status: 'active' },
    { id: 'membership_2', kitchenId: 'kitchen_2', userId: 'user', role: 'member', status: 'active' }
  ],
  kitchenEventSelections: [],
  completedEvents: [
    { id: 'event_history_1', title: 'event_history_1', date: '2026-10-10', location: 'location_1' }
  ]
};
