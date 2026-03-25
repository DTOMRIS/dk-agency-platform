'use client';

import { useEffect } from 'react';

export function useEditorialShell() {
  useEffect(() => {
    document.body.classList.add('editorial-shell');
    return () => {
      document.body.classList.remove('editorial-shell');
    };
  }, []);
}
