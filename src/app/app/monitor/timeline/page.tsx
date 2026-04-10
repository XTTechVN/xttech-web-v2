import MonitorDisplay from './_components/MonitorDisplay';
import ControllBtn from './_components/ControllBtn';
import Timline from './_components/Timline';

export default function Page() {
  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-gray-50 overflow-hidden">
      {/* Top: Video Monitor */}
      <div className="flex-1 p-4 flex flex-col min-h-0">
        <MonitorDisplay />
      </div>

      {/* Middle: Control Bar */}
      <ControllBtn />

      {/* Bottom: Timeline Ruler */}
      <Timline />
    </div>
  );
}
