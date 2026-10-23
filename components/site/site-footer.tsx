import { TransitionLink } from "@/components/site/veil";
import { SgClock } from "@/components/site/live-readouts";
import LiquidGradient from "@/components/site/liquid-gradient";
import { EMAIL, socials } from "@/lib/site-content";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__panel">
        <LiquidGradient className="site-footer__liquid" />
        <div className="site-footer__cta">
          <p className="label">Got an idea?</p>
          <TransitionLink href="/contact" className="site-footer__contact display">
            Let’s build it
          </TransitionLink>
        </div>

        <div className="site-footer__row grid">
          <div className="site-footer__socials">
            <ul>
              {socials.map((social) => (
                <li key={social.label}>
                  <a className="u-link u-link--alt" href={social.href} target="_blank" rel="noreferrer">
                    {social.label}
                  </a>
                </li>
              ))}
              <li>
                <a className="u-link u-link--alt" href={`mailto:${EMAIL}`}>
                  Email
                </a>
              </li>
            </ul>
            <p className="muted">{EMAIL}</p>
          </div>

          <div className="site-footer__time">
            <SgClock className="site-footer__clock" />
            <span className="muted">(SGT)</span>
          </div>

          <p className="site-footer__copy muted">©{new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
