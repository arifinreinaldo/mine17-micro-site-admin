'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export default function RouteLoading() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60]">
      <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 animate-pulse shadow-lg">
        <div className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50 animate-[shimmer_1s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
