export default function RolesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="p-4 font-body md:p-6 [&_h1]:font-heading [&_h2]:font-heading [&_h3]:font-heading">{children}</div>;
}
