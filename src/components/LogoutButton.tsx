"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useDictionary } from "@/lib/i18n/LocaleProvider";

export function LogoutButton() {
  const dict = useDictionary();
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }}>
      {dict.logout.label}
    </a>
  );
}
