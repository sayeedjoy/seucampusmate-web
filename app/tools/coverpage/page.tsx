import { Metadata } from 'next'
import CoverPageGenerator from './component/CoverPageGenerator'

export const metadata: Metadata = {
  title: 'Cover Page Generator | Campusmate',
  description: 'Generate professional cover pages for your assignments with our easy-to-use cover page generator.',
  keywords: ['cover page', 'assignment', 'generator', 'PDF', 'academic'],
}

export default function CoverPagePage() {
  return <CoverPageGenerator />
}
