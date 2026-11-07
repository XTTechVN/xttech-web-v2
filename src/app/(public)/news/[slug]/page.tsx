import { Header, Footer } from '../../_components';
import { NewsPublicDetail } from './_components/news-public-detail';

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-primary/15 selection:text-primary">
      <Header />
      <main>
        <NewsPublicDetail slug={decodeURIComponent(slug)} />
      </main>
      <Footer />
    </div>
  );
}
