import { Suspense } from 'react';
import ModernCartPage from './ModernCartPage';

export default function CartPage() {
  return (
    <Suspense fallback={
      <div className="max-w-3xl mx-auto p-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center py-8">Loading...</div>
        </div>
      </div>
    }>
      <ModernCartPage />
    </Suspense>
  );
}