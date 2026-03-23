import ProtectedLayout from "@/components/layout/protected-layout";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
