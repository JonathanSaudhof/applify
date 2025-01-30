import type { PropsWithChildren } from "react";

export default function PageContainer({ children }: PropsWithChildren) {
  return (
    <section className="flex flex-col gap-8 p-8" id="page-content">
      {children}
    </section>
  );
}
