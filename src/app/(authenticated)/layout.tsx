export const dynamic = 'force-dynamic';

import { AuthenticatedShell } from "./authenticated-shell";

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthenticatedShell>{children}</AuthenticatedShell>;
}
