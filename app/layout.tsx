import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Demo Feedback",
  description: "设计 Demo 分享与反馈收集工具"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
