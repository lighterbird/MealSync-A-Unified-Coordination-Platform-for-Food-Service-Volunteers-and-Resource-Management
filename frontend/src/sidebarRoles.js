export const sidebarRoles = [
  { id: 'volunteer', label: 'Volunteer', path: '/volunteer' },
  { id: 'organization', label: 'Organization', path: '/organization' },
  { id: 'kitchen', label: 'Community Kitchen', path: '/kitchen' },
  { id: 'donor', label: 'Donor', path: '/donor' }
];

export const defaultSidebarRoles = sidebarRoles.map(role => role.id);
