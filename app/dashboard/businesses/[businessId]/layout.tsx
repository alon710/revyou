"use client";

import { useEffect, useState } from "react";
import { BusinessDataProvider } from "@/contexts/BusinessDataContext";

interface BusinessLayoutProps {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}

export default function BusinessLayout({
  children,
  params,
}: BusinessLayoutProps) {
  const [businessId, setBusinessId] = useState<string | null>(null);

  useEffect(() => {
    params.then((p) => setBusinessId(p.businessId));
  }, [params]);

  if (!businessId) {
    return null;
  }

  return (
    <BusinessDataProvider businessId={businessId}>
      {children}
    </BusinessDataProvider>
  );
}
