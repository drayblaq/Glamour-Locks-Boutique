import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Login - Glamour Locks Boutique',
  description: 'Login to access the admin panel.',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}