// frontend/src/pages/admin/AdminMenuConfig.ts
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  Users, 
  Calendar,
  ShoppingBag,
  Megaphone,
  KeyRound, 
  MessageSquare,
  TrendingUp
} from 'lucide-react';

import AdminOverview from './AdminOverview';
import ManageProduct from './ManageProduct';
import ManageReceipt from './ManageReceipt';
import ManageUser from './ManageUser';
import AdminEvent from './AdminEvent';
import AdminAnnouncement from './AdminAnnouncement';
import FileUploadSample from './FileUploadSample';
import ManageForgotPassword from './ManageForgotPassword';
import ManageAuditLogs from './ManageAuditLog';
import ManageUserDocument from './ManageUserDocument';
import ManageGuestOrder from './ManageGuestOrder';
import ManageMessage from './ManageMessage'; 

// 🚀 NEW: Import your relational Sales Management engine interface
import ManageSale from './ManageSale'; 

export const ADMIN_MENU = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, component: AdminOverview },
  { id: 'products', label: 'Inventory', icon: Package, component: ManageProduct },
  { id: 'sales', label: 'Sales Registry', icon: TrendingUp, component: ManageSale }, // 💸 Added Relational Sales Management
  { id: 'guest-orders', label: 'Outside Orders', icon: ShoppingBag, component: ManageGuestOrder },
  { id: 'receipts', label: 'Orders & Receipts', icon: Receipt, component: ManageReceipt },
  { id: 'customers', label: 'User Directory', icon: Users, component: ManageUser },
  { id: 'user-documents', label: 'User Documents', icon: Package, component: ManageUserDocument },
  { id: 'messages', label: 'Visitor Messages', icon: MessageSquare, component: ManageMessage },
  { id: 'forgot-password', label: 'Account Recovery', icon: KeyRound, component: ManageForgotPassword },
  { id: 'audit-logs', label: 'Audit Logs', icon: LayoutDashboard, component: ManageAuditLogs },
  { id: 'events', label: 'Event Manager', icon: Calendar, component: AdminEvent },
  { id: 'announcements', label: 'Broadcast', icon: Megaphone, component: AdminAnnouncement },
];