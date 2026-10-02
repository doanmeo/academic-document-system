export default function LoadingSpinner({ text = 'Đang tải...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] py-8">
      <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
      <p className="mt-3 text-sm text-gray-500 font-medium">{text}</p>
    </div>
  )
}
