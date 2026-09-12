import {
  Home,
  ArrowUpCircle,
  ArrowDownCircle,
  Landmark,
  ArrowLeftRight,
  Contact,
  Package,
  Workflow,
  FileText,
  Boxes,
  LineChart,
  TrendingUp,
  Users,
  Wand2,
  Circle,
  type LucideIcon,
} from "lucide-react";

export const NAV_ICONS: Record<string, LucideIcon> = {
  home: Home,
  "arrow-up-circle": ArrowUpCircle,
  "arrow-down-circle": ArrowDownCircle,
  landmark: Landmark,
  "arrow-left-right": ArrowLeftRight,
  contact: Contact,
  package: Package,
  kanban: Workflow,
  "file-text": FileText,
  boxes: Boxes,
  "line-chart": LineChart,
  "trending-up": TrendingUp,
  users: Users,
  wand: Wand2,
};

export function navIcon(name: string): LucideIcon {
  return NAV_ICONS[name] ?? Circle;
}
