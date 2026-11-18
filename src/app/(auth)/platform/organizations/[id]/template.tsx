export default function PlatformOrganizationTemplate({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col gap-4 motion-safe:animate-rise">{children}</div>;
}
