import Header from "../../components/Header/Header";
import Providers from "../../components/Providers";

export default function HomeLayout({ children }) {
  return (
    <Providers>
      <div className="flex min-h-screen">
        <Header />
        <main className="flex-1 min-w-0 bg-gray-50">{children}</main>
      </div>
    </Providers>
  );
}
