import Header from "../../components/Header/Header";
import Providers from "../../components/Providers";

export default function HomeLayout({ children }) {
  return (
    <Providers>
      <Header />
      <main className="min-h-screen bg-gray-50 pl-[60px]">{children}</main>
    </Providers>
  );
}
