import { Edit, Eye, Trash2 } from 'lucide-react';

export default function TableAction({ onView, onEdit, onDelete }: { onView: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button className="text-gray-500 hover:text-primary cursor-pointer" onClick={onView}>
        <Eye size={16} />
      </button>
      <button className="text-gray-500 hover:text-primary cursor-pointer" onClick={onEdit}>
        <Edit size={16} />
      </button>
      <button className="text-gray-500 hover:text-red-600 cursor-pointer" onClick={onDelete}>
        <Trash2 size={16} />
      </button>
    </div>
  );
}
