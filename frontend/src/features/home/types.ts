import type { LucideIcon } from "lucide-react";

export type CurrentUser = {
  avatarUrl?: string;
  name: string;
};

export type BabyfootCardStatusTone = "available" | "busy" | "tournament";

export type BabyfootCardDetail = {
  icon: LucideIcon;
  label: string;
};

export type BabyfootCardData = {
  accent: string;
  ctaLabel?: string;
  details: BabyfootCardDetail[];
  footer?: string;
  id: number;
  location: string;
  name: string;
  occupancy: string;
  status: string;
  statusTone: BabyfootCardStatusTone;
  subtitle?: string;
};
