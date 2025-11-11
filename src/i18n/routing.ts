import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "he"],
  defaultLocale: "en",
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 365 * 24 * 60 * 60,
  },
});

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
