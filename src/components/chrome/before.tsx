import { Header } from "@/components/Header";

/* Skip link and header (client component with the mobile menu). */
export function Before() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[600] focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <Header />
    </>
  );
}
