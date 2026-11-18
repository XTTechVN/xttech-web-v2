export const LoadMore = ({ visible, total, loading, onClick }: { visible: number; total: number; loading: boolean; onClick: () => void }) => (
  <div className="flex flex-col items-center gap-2">
    <p className="text-xs text-gray-500">
      Đang hiện {visible}/{total}
    </p>
    {visible < total && (
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="h-11 rounded-md border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 active:scale-95 disabled:opacity-50"
      >
        {loading ? 'Đang tải...' : 'Xem thêm'}
      </button>
    )}
  </div>
);
