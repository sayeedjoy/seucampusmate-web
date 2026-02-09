import type { ReactNode } from "react";

export interface Integration {
  id: number;
  name: string;
  description: string;
  icon: ReactNode;
  href: string;
}
