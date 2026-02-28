import Skeleton from './Skeleton'

export default function MovieCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] w-full" />
      <div className="mt-2 space-y-1.5 px-0.5">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  )
}
