import { Toaster } from "sonner";
import type { ReactNode } from "react";

export default function AnimalsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "#0a0520",
            color: "white",
            border: "1px solid rgba(249, 113, 209, 0.2)",
            backdropFilter: "blur(8px)",
          },
          classNames: {
            success: "border-l-[3px] border-l-[#F971D1]",
            error: "border-l-[3px] border-l-[#FF3358]",
          },
        }}
      />
    </>
  );
}
