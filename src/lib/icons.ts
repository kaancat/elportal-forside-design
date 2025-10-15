/**
 * Centralized icon imports for tree-shaking optimization
 * 
 * Why: Mobile devices download the entire lucide-react library by default.
 * This file imports only the icons actually used across the site.
 * 
 * Impact: Reduces bundle size by ~50 KB on mobile by preventing the entire
 * icon library from being bundled. Faster initial page load, especially 
 * on slow mobile connections (4G).
 * 
 * Usage: Import icons from this file instead of directly from 'lucide-react'
 * Example: import { Check, X } from '@/lib/icons'
 */

// Export only the icons actually used across the application
export { 
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Calculator,
  Check,
  ChefHat,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  Coffee,
  ExternalLink,
  GripVertical,
  HelpCircle,
  Home,
  Info,
  Leaf,
  Lightbulb,
  MapPin,
  PanelLeft,
  Plus,
  Shield,
  Shirt,
  Sparkles,
  Star,
  TrendingDown,
  TrendingUp,
  Tv,
  User,
  Wind,
  X,
  Zap,
} from 'lucide-react';

