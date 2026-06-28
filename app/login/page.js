import { Suspense } from "react";
import LoginClient from "./LoginClient";

export const metadata = {
  title: "AgendaMeets - Login",
  description: "Página de login para o AgendaMeets.",
};

export default function LoginPage() {
  return (
    <Suspense>
      <LoginClient />
    </Suspense>
  );
}
