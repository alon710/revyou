import { ReactNode } from "react";
import "@/lib/env";

type Props = {
  children: ReactNode;
};

export default function RootLayout({ children }: Props) {
  return children;
}
