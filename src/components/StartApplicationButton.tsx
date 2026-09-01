"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function StartApplicationButton({
  action,
  label,
}: {
  action: () => Promise<string>;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="bg-green-deep hover:bg-green-mid transition-colors text-white font-semibold text-sm px-5 py-2.5 rounded-md disabled:opacity-60"
    >
      {isPending ? "Starting..." : label}
    </button>
  );
}
