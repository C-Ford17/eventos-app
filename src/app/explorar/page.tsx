import { Suspense } from 'react';
import ExplorarContent from './ExplorarContent';

export default function ExplorarPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <ExplorarContent />
    </Suspense>
  );
}
