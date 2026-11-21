export default function RemakeTemplate({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="motion-safe:animate-rm-rise">{children}</div>;
}
