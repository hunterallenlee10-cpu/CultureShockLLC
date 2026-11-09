'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { prefersReducedMotion } from '@/lib/bus';

type VTDocument = Document & { startViewTransition?: (cb: () => Promise<void> | void) => { finished: Promise<void> } };

/**
 * Link that morphs the element marked [data-vt-source] inside it into the element
 * marked [data-vt-target="<slug>"] on the next page, using the View Transitions API.
 * Falls back to a normal client navigation.
 */
export function TransitionLink({
  href,
  slug,
  children,
  className,
  ...rest
}: { href: string; slug: string; children: React.ReactNode; className?: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  'href'
>) {
  const router = useRouter();
  return (
    <Link
      href={href}
      className={className}
      {...rest}
      onClick={(e) => {
        const doc = document as VTDocument;
        if (!doc.startViewTransition || prefersReducedMotion() || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        const src = e.currentTarget.querySelector<HTMLElement>('[data-vt-source]');
        if (src) src.style.viewTransitionName = 'project-hero';
        doc.startViewTransition(
          () =>
            new Promise<void>((resolve) => {
              router.push(href, { scroll: false });
              // rAF is paused while a view transition's DOM update is pending, so watch
              // the DOM (and fall back to a timer) to know when the case study has rendered.
              let done = false;
              const finish = () => {
                if (done) return;
                done = true;
                mo.disconnect();
                clearTimeout(timer);
                window.__lenis?.scrollTo(0, { immediate: true, force: true });
                window.scrollTo(0, 0);
                resolve();
              };
              const ready = () => document.querySelector(`[data-vt-target="${slug}"]`) && finish();
              const mo = new MutationObserver(ready);
              mo.observe(document.body, { childList: true, subtree: true });
              const timer = setTimeout(finish, 2500);
              ready();
            }),
        );
      }}
    >
      {children}
    </Link>
  );
}
