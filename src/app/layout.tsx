import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import { loadCurrentUser } from "@/features/auth/server/load-current-user";
import { CurrentUserProvider } from "@/features/auth/context/current-user-context";
import { NaverMapLoader } from "@/components/NaverMapLoader";

export const metadata: Metadata = {
  title: "맛집 리뷰 플랫폼",
  description: "지도로 찾고, 리뷰로 공유하는 우리 동네 맛집",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const currentUser = await loadCurrentUser();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased font-sans">
        <Providers>
          <CurrentUserProvider initialState={currentUser}>
            {children}
          </CurrentUserProvider>
        </Providers>

        {/* 네이버 지도 SDK 동적 로딩 */}
        <NaverMapLoader />
      </body>
    </html>
  );
}
