import { 
  ShoppingBag, 
  Receipt, 
  CalendarDays, 
  ShoppingCart, 
  User,
  Megaphone // Import the new icon
} from 'lucide-react';

// Import the components so the array can reference them
import CustomerShop from './CustomerShop';
import CustomerOrders from './CustomerOrders';
import CustomerEvent from './CustomerEvent';
import CustomerCart from './CustomerCart';
import CustomerProfile from './CustomerProfile';
import CustomerAnnouncement from './CustomerAnnouncement'; // Import the announcement component

export const CUSTOMER_MENU = [
  // I recommend putting Announcements at the top so it's the first thing customers see
  { 
    id: 'announcements', 
    label: 'Announcements', 
    icon: Megaphone, 
    component: CustomerAnnouncement 
  },
  { 
    id: 'shop', 
    label: 'Marketplace', 
    icon: ShoppingBag, 
    component: CustomerShop 
  },
  { 
    id: 'receipts', 
    label: 'My Orders', 
    icon: Receipt, 
    component: CustomerOrders 
  },
  { 
    id: 'events', 
    label: 'My Events', 
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
];