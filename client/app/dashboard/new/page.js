"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import AddCarWizard from "../AddCarWizard";

export default function NewListingPage() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    } else if (!isPending && session?.user?.role !== "dealer") {
      router.push("/dashboard");
    }
  }, [isPending, session, router]);

  if (isPending || !session || session.user.role !== "dealer") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="h-2.5 w-2.5 rounded-full bg-primary-500 animate-pulse" />
      </div>
    );
  }

  return <AddCarWizard />;
}
