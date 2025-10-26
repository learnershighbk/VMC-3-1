'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Review detail page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12 text-center">
      <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
      <p className="text-muted-foreground mb-6">
        페이지를 불러오는 중 오류가 발생했습니다.
      </p>
      <Button onClick={reset}>다시 시도</Button>
    </div>
  );
}
