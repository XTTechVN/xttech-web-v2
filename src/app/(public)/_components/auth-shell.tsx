import { XTLogo } from '@/components';

interface AuthShellProps {
  title: string;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

// Khung chung cho trang đăng nhập / quên mật khẩu: mobile một cột, từ 1024px chia đôi (thương hiệu | form)
const AuthShell = ({ title, subtitle, children, footer }: AuthShellProps) => {
  return (
    <main className="font-body grid min-h-dvh grid-cols-[minmax(0,1fr)] bg-gray-50 lg:grid-cols-2">
      <aside className="relative hidden min-w-0 flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex">
        <svg
          aria-hidden="true"
          viewBox="0 0 600 800"
          preserveAspectRatio="xMidYMax slice"
          className="pointer-events-none absolute inset-0 h-full w-full text-white"
          fill="none"
          stroke="currentColor"
        >
          <path d="M-40 560 C 120 420, 300 380, 640 470" strokeOpacity="0.35" />
          <path d="M-40 640 C 160 500, 360 520, 640 640" strokeOpacity="0.25" />
          <path d="M80 820 C 140 620, 360 560, 640 600" strokeOpacity="0.2" />
        </svg>
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/40" />

        <div className="relative flex items-center gap-2.5">
          <XTLogo variant="solid" className="h-9 w-9" />
          <span className="font-lexend text-xl font-semibold tracking-tight">XTTECH</span>
        </div>

        <div className="relative flex max-w-md flex-col gap-3">
          <h2 className="font-lexend text-3xl font-semibold leading-tight tracking-tight">Nền tảng quản lý nội bộ dành cho doanh nghiệp</h2>
          <p className="text-sm leading-relaxed text-white/80">
            Quản lý sản xuất, kho hàng và chất lượng sản phẩm trong thời gian thực, trên một hệ thống duy nhất.
          </p>
        </div>

        <p className="relative text-xs text-white/70">© {new Date().getFullYear()} XTTECH. Bảo lưu mọi quyền.</p>
      </aside>

      <section className="flex min-w-0 flex-col px-4 py-8 sm:px-8">
        <div className="flex items-center justify-center gap-2.5 text-primary lg:hidden">
          <XTLogo variant="solid" className="h-9 w-9" />
          <span className="font-lexend text-xl font-semibold tracking-tight">XTTECH</span>
        </div>

        <div className="m-auto flex w-full max-w-sm flex-col gap-6 py-8">
          <header className="flex flex-col gap-1.5 text-center">
            <h1 className="font-lexend text-2xl font-semibold tracking-tight text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
          </header>
          {children}
          {footer && <div className="text-center text-sm text-gray-500">{footer}</div>}
        </div>
      </section>
    </main>
  );
};

export default AuthShell;
