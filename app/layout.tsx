import type { Metadata } from "next";
import StyledComponentsRegistry from './lib/styleRegistry';
import "./globals.css";

export const metadata: Metadata = {
  title: "Home Library",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className='antialiased'>
        <StyledComponentsRegistry>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
