import type { PropsWithChildren, ReactElement } from 'react';

export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
};

export default function AuthLayout({ children }: PropsWithChildren): ReactElement {
  return <>{children}</>;
}
