import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "页面高频词汇分析",
  description: "分析网页内容中的高频词汇并可视化展示",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">{children}</body>
    </html>
  );
}
