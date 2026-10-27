// Thành phần dùng riêng cho trang
import { Header, Hero, Footer, AppLauncherRedirect } from './_components';

export default function Home() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-blue-100 selection:text-blue-900 ">
      <AppLauncherRedirect />
      <Header />
      <main>
        <Hero />
      </main>
      <Footer />
    </div>
  );
}
