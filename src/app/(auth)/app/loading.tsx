export default function Loading() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-300 border-t-blue-600" />
      <h3 className="ml-2 text-sm font-medium text-slate-600">Loading...</h3>
    </div>
  );
}
