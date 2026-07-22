export default function CreatorLoading() {
  return (
    <main className="min-h-screen bg-[#FFFDFC] text-[#202A3D]" aria-busy="true" aria-label="Loading Creator workspace">
      <div className="border-b border-[#E8CDD6] bg-[#FFF8F6]">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="h-4 w-44 animate-pulse rounded bg-[#E8CDD6] motion-reduce:animate-none" />
          <div className="mt-4 h-10 w-full max-w-md animate-pulse rounded bg-[#F1E4E8] motion-reduce:animate-none" />
          <div className="mt-8 flex gap-3 overflow-hidden">
            {[96, 90, 104, 108].map((width) => (
              <div key={width} className="h-11 shrink-0 animate-pulse rounded bg-[#F1E4E8] motion-reduce:animate-none" style={{ width }} />
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-9 w-48 animate-pulse rounded bg-[#E8CDD6] motion-reduce:animate-none" />
        <div className="mt-7 divide-y divide-[#E8CDD6] border-y border-[#E8CDD6]">
          {[0, 1, 2].map((item) => (
            <div key={item} className="grid gap-3 py-5 sm:grid-cols-[minmax(0,1fr)_180px_130px]">
              <div className="h-11 animate-pulse rounded bg-[#F6ECEF] motion-reduce:animate-none" />
              <div className="h-11 animate-pulse rounded bg-[#F6ECEF] motion-reduce:animate-none" />
              <div className="h-11 animate-pulse rounded bg-[#F6ECEF] motion-reduce:animate-none" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
