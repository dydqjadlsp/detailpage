import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'AutoPage - AI 기반 상세페이지 생성기',
  description: 'AI가 5분 만에 전문가급 상세페이지를 만들어줍니다. 11가지 산업 카테고리에 최적화된 상세페이지를 지금 바로 시작하세요.',
  keywords: ['상세페이지', '랜딩페이지', 'AI', '자동생성', '이커머스', '부동산', '병원'],
  openGraph: {
    title: 'AutoPage - AI 기반 상세페이지 생성기',
    description: 'AI가 5분 만에 전문가급 상세페이지를 만들어줍니다.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}


