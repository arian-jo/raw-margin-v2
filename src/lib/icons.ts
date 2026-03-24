import { 
  Circle, Heart, Home, Wallet, Utensils, GraduationCap, Bus, Zap, 
  Briefcase, ShoppingCart, Plane, Dumbbell, Receipt, CreditCard, 
  Music, Car, Gamepad2, Gift, Wrench, Baby, FileText, Shirt, Scissors 
} from 'lucide-react';

export const ICONS = [
  { name: 'Heart', component: Heart },
  { name: 'Home', component: Home },
  { name: 'Wallet', component: Wallet },
  { name: 'Utensils', component: Utensils },
  { name: 'GraduationCap', component: GraduationCap },
  { name: 'Bus', component: Bus },
  { name: 'Car', component: Car },
  { name: 'Zap', component: Zap },
  { name: 'Briefcase', component: Briefcase },
  { name: 'ShoppingCart', component: ShoppingCart },
  { name: 'Plane', component: Plane },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Receipt', component: Receipt },
  { name: 'CreditCard', component: CreditCard },
  { name: 'Music', component: Music },
  { name: 'Gamepad2', component: Gamepad2 },
  { name: 'Gift', component: Gift },
  { name: 'Wrench', component: Wrench },
  { name: 'Baby', component: Baby },
  { name: 'FileText', component: FileText },
  { name: 'Shirt', component: Shirt },
  { name: 'Scissors', component: Scissors },
];

export const getIconComponent = (name?: string | null) => {
  return ICONS.find(i => i.name === name)?.component || Circle;
};
