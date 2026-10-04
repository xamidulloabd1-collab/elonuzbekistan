// app/xarita/page.jsx - E'lonlar xaritasi (narx belgilari bilan)
import { ListingsMap } from '@/components/map';

export const metadata = {
  title: "E'lonlar xaritada — E'lonUz",
  description: "Uy-joy, mashina va boshqa e'lonlarni xaritada ko'ring: narxi va joylashuvi bir qarashda.",
};

export default function MapPage({ searchParams }) {
  return <ListingsMap initialCategory={searchParams.category || ''} initialRegion={searchParams.region || ''} />;
}
