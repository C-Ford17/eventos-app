// src/app/dashboard/staff/layout.tsx
import { StaffProvider } from '@/contexts/StaffContext';

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <StaffProvider>
      <div className="min-h-screen bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </div>
      </div>
    </StaffProvider>
  );
}
