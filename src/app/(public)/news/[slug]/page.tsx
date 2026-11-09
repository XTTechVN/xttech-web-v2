import { NewsPublicDetail } from './_components/news-public-detail';

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <main>
      <NewsPublicDetail slug={decodeURIComponent(slug)} />
    </main>
  );
}
