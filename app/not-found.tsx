import type { Metadata } from "next";
import SiteLayout from "./(site)/layout";
import { TransitionLink } from "@/components/site/veil";

export const metadata: Metadata = { title: "Page not found | Muhammad Fathir Yudhistira" };

// Unmatched URLs land here, outside the (site) group, so it borrows that layout for the header and footer.
export default function NotFound() {
  return (
    <SiteLayout>
      <div data-page className="page">
        <section className="hero grid">
          <p className="hero__meta label">
            <span>Error 404</span>
            <span>Page not found</span>
          </p>
          <h1 className="hero__title display not-found__title">Lost the plot.</h1>
          <div className="hero__lede lead not-found__body">
            <p>This page doesn’t exist, or it moved.</p>
            <p className="not-found__links">
              <TransitionLink href="/" className="u-link">
                Back home
              </TransitionLink>
              <TransitionLink href="/work" className="u-link">
                See the work
              </TransitionLink>
            </p>
          </div>
        </section>
      </div>
    </SiteLayout>
  );
}
