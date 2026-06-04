import type { ReactNode } from 'react'
import { Category } from '../types/garment'

export interface CategoryConfig {
  category: Category
  label: string
  shortLabel: string
  icon: ReactNode
}

export const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    category: Category.HEAD,
    label: 'Nakrycia głowy',
    shortLabel: 'Głowa',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2C8.13 2 5 5.13 5 9v3l-1 2h16l-1-2V9c0-3.87-3.13-7-7-7z" />
        <path d="M9 20c0 1.1.9 2 2 2h2a2 2 0 002-2v-1H9v1z" />
      </svg>
    ),
  },
  {
    category: Category.TOP,
    label: 'Góra',
    shortLabel: 'Góra',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.38 3.46L16 2a4 4 0 01-8 0L3.62 3.46a2 2 0 00-1.34 2.23l.58 3.57a1 1 0 00.99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 002-2V10h2.15a1 1 0 00.99-.84l.58-3.57a2 2 0 00-1.34-2.23z" />
      </svg>
    ),
  },
  {
    category: Category.BOTTOM,
    label: 'Dół',
    shortLabel: 'Dół',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M6 2h12l1 8-5 2-2 10-2-10-5-2 1-8z" />
      </svg>
    ),
  },
  {
    category: Category.SHOES,
    label: 'Obuwie',
    shortLabel: 'Obuwie',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 18h16a2 2 0 002-2v-1a2 2 0 00-2-2h-2L9 6H7L4 13H2v5z" />
        <path d="M14 13l1-4" />
      </svg>
    ),
  },
  {
    category: Category.ACCESSORIES,
    label: 'Dodatki',
    shortLabel: 'Dodatki',
    icon: (
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" />
      </svg>
    ),
  },
]
