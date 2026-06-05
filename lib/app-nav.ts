export const APP_ROUTES = {
  home: "/",
  list: "/list",
  timeline: "/timeline",
  day: "/day",
  settings: "/settings",
} as const;

export type NavItemId = keyof typeof APP_ROUTES;

export type NavItemConfig = {
  id: NavItemId;
  href: string;
  label: string;
  enabled: boolean;
  prominent?: boolean;
};

export const NAV_ITEMS: NavItemConfig[] = [
  { id: "list", href: APP_ROUTES.list, label: "List", enabled: true },
  {
    id: "timeline",
    href: APP_ROUTES.timeline,
    label: "Timeline",
    enabled: true,
  },
  {
    id: "home",
    href: APP_ROUTES.home,
    label: "Home",
    enabled: true,
    prominent: true,
  },
  {
    id: "day",
    href: APP_ROUTES.day,
    label: "Day to Day",
    enabled: true,
  },
  {
    id: "settings",
    href: APP_ROUTES.settings,
    label: "Settings",
    enabled: true,
  },
];
