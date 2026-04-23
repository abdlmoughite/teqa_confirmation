const Loading = () => {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/4"></div>

      <div className="grid grid-cols-3 gap-4">
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-24 bg-gray-300 dark:bg-gray-700 rounded"></div>
      </div>

      <div className="h-40 bg-gray-300 dark:bg-gray-700 rounded"></div>
    </div>
  );
};

export default Loading;