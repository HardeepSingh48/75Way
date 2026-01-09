import type { ReactNode } from 'react';

interface ProtectedRouteProps {
    children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    // For simplicity, we'll just render the children
    // In a real app, you'd check authentication state here
    return <>{children}</>;
}
