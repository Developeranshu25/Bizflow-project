function renderSidebar(active) {
  const links = [
    { href: 'dashboard.html', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`, label: 'Dashboard' },
    { section: 'Inventory' },
    { href: 'inventory.html', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path d="M20 7H4a1 1 0 00-1 1v11a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>`, label: 'Products' },
    { section: 'Billing' },
    { href: 'new-invoice.html', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>`, label: 'New Invoice' },
    { href: 'invoices.html', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg>`, label: 'Invoices' },
    { href: 'parties.html', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`, label: 'Parties' },
    { section: 'Analytics' },
    { href: 'reports.html', icon: `<svg fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`, label: 'Reports' },
  ];

  const items = links.map(l => {
    if (l.section) return `<div class="nav-section">${l.section}</div>`;
    const isActive = l.href === active;
    return `<a href="${l.href}" class="nav-link${isActive ? ' active' : ''}">${l.icon}${l.label}</a>`;
  }).join('');

  return `
  <aside class="sidebar">
    <div class="sidebar-brand">
      <h1>BIZFLOW</h1>
      <p>Billing System</p>
    </div>
    <nav class="sidebar-nav">${items}</nav>
    <div class="sidebar-footer">
      <div class="username" id="sidebar-user"></div>
      <button class="btn-logout" onclick="logout()">Sign Out</button>
    </div>
  </aside>`;
}
