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
            background:
              "linear-gradient(to bottom right, rgba(26, 11, 46, 0.95), rgba(44, 18, 80, 0.95))",
            color: "white",
            border: "1px solid rgba(159, 110, 255, 0.2)",
            backdropFilter: "blur(8px)",
          },
          classNames: {
            success: "border-l-[3px] border-l-[#9f6eff]",
            error: "border-l-[3px] border-l-[#f43f5e]",
          },
        }}
      />
    </>
  );
}
