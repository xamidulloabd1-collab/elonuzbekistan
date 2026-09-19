// app/elonlar/loading.jsx - Ro'yxat yuklanayotganda ko'rsatiladigan skelet
export default function Loading() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="h-8 w-48 bg-gray-200 dark:bg-surface-800 rounded-lg animate-pulse mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[4/3] bg-gray-200 dark:bg-surface-800 animate-pulse" />
            <div className="p-3 flex flex-col gap-2">
              <div className="h-4 bg-gray-200 dark:bg-surface-800 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-gray-200 dark:bg-surface-800 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
