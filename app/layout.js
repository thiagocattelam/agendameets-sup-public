import Header from "../components/Header/Header";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-br">
      <body>
        <div className="flex min-h-screen">
          <Header />
          <main className="flex-1 min-w-0 bg-gray-50">{children}</main>
        </div>
      </body>
    </html>
  );
}
