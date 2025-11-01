interface NavItem {
  title: string;
  href: string;
}

// Dashboard navigation items (for authenticated users)
export const dashboardNavItems: NavItem[] = [
  {
    title: "העסק שלי",
    href: "/locations",
  },
  {
    title: "ביקורות",
    href: "/reviews",
  },
];

// Landing page navigation items (for unauthenticated users)
export const landingNavItems: NavItem[] = [
  {
    title: "איך זה עובד",
    href: "/#how-it-works",
  },
  {
    title: "מחירון",
    href: "/#pricing",
  },
  {
    title: "שאלות נפוצות",
    href: "/#faq",
  },
];

// Legacy export for backward compatibility (can be removed later)
export const navItems: NavItem[] = dashboardNavItems;
