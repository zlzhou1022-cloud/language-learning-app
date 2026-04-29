import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Language Learning App",
  description: "A minimalist language learning application",
};

// 根布局不渲染 html/body，交给 [locale]/layout.tsx 处理
// 这样 [locale]/layout.tsx 可以动态设置 lang 属性
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
