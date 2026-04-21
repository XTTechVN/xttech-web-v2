import Heading from '@/components/ui/Heading';
import SubHeading from '@/components/ui/SubHeading';
import MapContainer from './_components/MapContainer';

export default function CameraMapPage() {
  return (
    <div className="space-y-4 p-4">
      <div>
        <Heading>Bản đồ camera</Heading>
        <SubHeading>Quản lý, theo dõi các camera tại các vị trí khác nhau</SubHeading>
      </div>

      <MapContainer />
    </div>
  );
}
