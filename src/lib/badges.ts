
import type { LucideIcon } from 'lucide-react';
import { Target, Repeat, Timer, KeyRound } from 'lucide-react';

// Import the Badge type from types.ts
import type { Badge } from './types';

export const BADGES: Badge[] = [
  { id: 'first-blood', name: 'İlk Kan', description: 'İlk doğru cevabını verdin!', icon: Target },
  { id: 'serial-corrector', name: 'Seri Doğrucu', description: 'Art arda 5 doğru cevap verdin.', icon: Repeat },
  { id: 'time-master', name: 'Zaman Ustası', description: 'Sürenin yarısını kullanmadan testi bitirdin.', icon: Timer },
  { id: 'mystery-master', name: 'Gizemli Usta', description: '3 farklı dersten test tamamladın.', icon: KeyRound },
];
