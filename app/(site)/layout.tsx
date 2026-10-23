import SiteHeader from "@/components/site/site-header";
import SiteFooter from "@/components/site/site-footer";
import "./site.css";

// Shared chrome for the editorial pages (home, work, case studies, about). /contact sits outside
// this group and keeps its own design.
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SiteHeader />
      <main id="content" className="site-main">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
