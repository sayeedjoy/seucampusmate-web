import CoverPageGenerator from './component/CoverPageGenerator';
import { createPageMetadata } from '@/lib/metadata';

export const metadata = createPageMetadata('coverpage');

export default function CoverPagePage() {
  return <CoverPageGenerator />
}
