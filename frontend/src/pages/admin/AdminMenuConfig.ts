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
  MessageSquare
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

// 🚀 NEW: Import your Guest Order management interface
import ManageGuestOrder from './ManageGuestOrder';
import ManageMessage from './ManageMessage'; // Import the new message management component

export const ADMIN_MENU = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard, component: AdminOverview },
  { id: 'products', label: 'Inventory', icon: Package, component: ManageProduct },
  { id: 'guest-orders', label: 'Outside Orders', icon: ShoppingBag, component: ManageGuestOrder },
  { id: 'receipts', label: 'Orders & Receipts', icon: Receipt, component: ManageReceipt },
  { id: 'customers', label: 'User Directory', icon: Users, component: ManageUser },
  { id: 'user-documents', label: 'User Documents', icon: Package, component: ManageUserDocument },
  { id: 'audit-logs', label: 'Audit Logs', icon: LayoutDashboard, component: ManageAuditLogs },
  { id: 'forgot-password', label: 'Account Recovery', icon: KeyRound, component: ManageForgotPassword },
  { id: 'events', label: 'Event Manager', icon: Calendar, component: AdminEvent },
  { id: 'announcements', label: 'Broadcast', icon: Megaphone, component: AdminAnnouncement },
  { id: 'file-upload', label: 'Media Upload', icon: Package, component: FileUploadSample },
  { id: 'messages', label: 'Visitor Messages', icon: MessageSquare, component: ManageMessage }, // Add the new menu item for message management
];