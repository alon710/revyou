import "@testing-library/jest-dom";
import dotenv from "dotenv";
import { vi } from "vitest";

dotenv.config({ path: ".env" });

vi.mock("server-only", () => {
  return {};
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
  useLocale: () => "en",
}));
