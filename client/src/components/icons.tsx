import React from "react";
import {
  LayoutDashboard,
  Wallet,
  Store,
  Box,
  Users,
  FileText,
  BarChart2,
  Settings,
  Search,
  User,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  Bell,
  Menu,
  ChevronRight,
  Filter,
  Image,
  CreditCard,
  LifeBuoy,
  LogOut,
} from "lucide-react";

export const WalletLogo: React.FC<{ className?: string }> = ({
  className = "w-7 h-7 text-[#22c55e]",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M19 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h13a2 2 0 0 0 2-2v-2" />
    <path d="M16 8h5a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2z" />
    <circle cx="18" cy="12" r="0.8" fill="currentColor" stroke="none" />
  </svg>
);

export const CalcMathIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="4.5" y1="6.5" x2="10.5" y2="6.5" />
    <line x1="7.5" y1="3.5" x2="7.5" y2="9.5" />
    <line x1="14.5" y1="6.5" x2="19.5" y2="6.5" />
    <line x1="5.5" y1="15.5" x2="9.5" y2="19.5" />
    <line x1="9.5" y1="15.5" x2="5.5" y2="19.5" />
    <line x1="14.5" y1="16" x2="19.5" y2="16" />
    <line x1="14.5" y1="19.5" x2="19.5" y2="19.5" />
  </svg>
);

export const Icons = {
  Dashboard: LayoutDashboard,
  Deymaha: Wallet,
  Vendor: Store,
  Products: Box,
  Reseller: Users,
  Broadcast: FileText,
  Reports: BarChart2,
  Settings,
  Search,
  User,
  Plus,
  DebtAdd: ArrowUpRight,
  DebtPay: ArrowDownLeft,
  Success: CheckCircle2,
  Warning: AlertTriangle,
  Close: X,
  Clock,
  Bell,
  Menu,
  ChevronRight,
  Filter,
  Image,
  CreditCard,
  LifeBuoy,
  LogOut,
};
