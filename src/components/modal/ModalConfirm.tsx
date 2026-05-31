import Button from '../ui/Button';

export default function ModalConfirm({
  title,
  description,
  isLoading,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const descs = description.split('\\n');

  return (
    <div className="p-6 rounded-lg bg-white space-y-4">
      <h2 className="text-primary text-xl font-semibold">{title}</h2>
      <div className="space-y-1">
        {descs.map((desc, index) => (
          <p key={index} className="text-sm text-gray-500">
            {desc}
          </p>
        ))}
      </div>
      <div className="flex items-center gap-2 justify-end">
        <Button onClick={onCancel} variant="outline" disabled={isLoading} size="sm">
          Hủy
        </Button>
        <Button onClick={onConfirm} disabled={isLoading} size="sm">
          Xác nhận
        </Button>
      </div>
    </div>
  );
}
