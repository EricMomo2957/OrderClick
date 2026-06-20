import { 
  ShoppingBag, 
  Receipt, 
  CalendarDays, 
  ShoppingCart, 
  User,
  Megaphone,
  LayoutDashboard // Added this icon
} from 'lucide-react';

// Import the components
import DashboardHome from './DashboardHome'; // Added import
import CustomerShop from './CustomerShop';
import CustomerOrders from './CustomerOrders';
import CustomerEvent from './CustomerEvent';
import CustomerCart from './CustomerCart';
import CustomerProfile from './CustomerProfile';
import CustomerAnnouncement from './CustomerAnnouncement'; 
import UserDocument from './UserDocument'; 

export const CUSTOMER_MENU = [
  // Dashboard is now the primary entry point
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: LayoutDashboard, 
    component: DashboardHome 
  },
  { 
    id: 'shop', 
    label: 'Marketplace', 
    icon: ShoppingBag, 
    component: CustomerShop 
  },
  { 
    id: 'announcements', 
    label: 'Announcements', 
    icon: Megaphone, 
    component: CustomerAnnouncement 
  },
  { 
    id: 'receipts', 
    label: 'Orders', 
    icon: Receipt, 
    component: CustomerOrders 
  },
  { 
    id: 'events', 
    label: 'Events', 
    icon: CalendarDays, 
    component: CustomerEvent 
  },
  { 
    id: 'cart', 
    label: 'Shopping Cart', 
    icon: ShoppingCart, 
    component: CustomerCart 
  },
  { 
    id: 'profile', 
    label: 'Account Profile', 
    icon: User, 
    component: CustomerProfile 
  },
  { 
    id: 'documents', 
    label: 'User Documents', 
    icon: User, 
    component: UserDocument 
  }
];