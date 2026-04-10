import Heading from '@/components/ui/Heading';
import MapContainer from './_components/MapContainer';

export default function CameraMapPage() {
  return (
    <div className="space-y-4 p-4">
      <Heading>Bản đồ camera</Heading>

      <MapContainer />
    </div>
  );
}
