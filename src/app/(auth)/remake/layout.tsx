import { RemakeShell } from './_components/remake-shell';

export default function RemakeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <RemakeShell>{children}</RemakeShell>;
}
