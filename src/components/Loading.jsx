export default function Loading() {
  return (
    <div className="flex min-h-[300px] items-center justify-center">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />

        <p className="mt-3 text-sm text-gray-500">
          Loading Smart Farmer...
        </p>
      </div>
    </div>
  );
}