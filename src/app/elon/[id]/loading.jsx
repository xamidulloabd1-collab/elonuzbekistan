// app/elon/[id]/loading.jsx
export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-6 animate-pulse">
      <div className="h-4 w-32 bg-gray-200 dark:bg-surface-800 rounded mb-4" />
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="aspect-video bg-gray-200 dark:bg-surface-800 rounded-2xl" />
          <div className="h-6 w-3/4 bg-gray-200 dark:bg-surface-800 rounded mt-6" />
          <div className="h-8 w-1/3 bg-gray-200 dark:bg-surface-800 rounded mt-3" />
        </div>
        <div className="h-48 bg-gray-200 dark:bg-surface-800 rounded-2xl" />
      </div>
    </div>
  );
}
