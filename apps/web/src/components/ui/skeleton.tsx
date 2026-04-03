import { cn } from '@/lib/utils';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-800', className)}
      {...props}
    />
  );
}

function SongCardSkeleton() {
  return (
    <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5">
      <Skeleton className="aspect-square w-full rounded-lg mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

function SongRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 border-b border-white/5">
      <Skeleton className="w-12 h-12 rounded-lg flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <Skeleton className="h-4 w-48 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-dark-900/50 border-r border-white/5 p-4">
      <Skeleton className="h-10 w-40 mb-6" />
      <Skeleton className="h-20 w-full rounded-xl mb-4" />
      <div className="space-y-2 mb-6">
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
      <Skeleton className="h-px w-full mb-4" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
      <div className="mt-auto pt-4">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </aside>
  );
}

function TopbarSkeleton() {
  return (
    <header className="h-16 border-b border-white/5 px-6 flex items-center justify-between">
      <Skeleton className="h-4 w-48" />
      <div className="flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
      </div>
    </header>
  );
}

function CreatePageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
        <Skeleton className="aspect-square w-full rounded-xl" />
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-6">
        <Skeleton className="w-24 h-24 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
        <Skeleton className="h-32 rounded-xl" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  SongCardSkeleton,
  SongRowSkeleton,
  SidebarSkeleton,
  TopbarSkeleton,
  CreatePageSkeleton,
  ProfileSkeleton,
};
