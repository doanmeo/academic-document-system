export default function Spinner({ size = 8, className = '' }: { size?: number; className?: string }) {
  return <div className={`animate-spin rounded-full border-2 border-primary/20 border-t-primary h-${size} w-${size} ${className}`} />
}
export { Spinner }
