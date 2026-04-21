import { DatePicker } from "antd";
import Search from "@/components/ui/Search";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";

interface ToolbarProps {
  label: string;
  setLabel: (label: string) => void;
}

export default function Toolbar({ label, setLabel }: ToolbarProps) {
  return <div>
    <div className="flex items-center gap-4">
        <Select
          size="sm"
          placeholder="Chọn loại đối tượng"
          options={[
            { label: 'Tất cả', value: 'all' },
            { label: 'Biển số xe', value: 'plate' },
          ]}
          onChange={(value) => setLabel(value as string)}
        />

        {/* <Search size="sm" placeholder="Nhập biển số xe" className="w-96" onChange={(value) => setDetectionResult(value as string)} />
        
        <DatePicker
          placeholder="Chọn ngày"
          className='h-9'
          onChange={(value) => setDate(value)}
        />
        <Button size="sm" onClick={onSearch}>Tìm kiếm</Button> */}
      </div></div>;
}
