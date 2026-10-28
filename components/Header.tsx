"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type MouseEvent } from "react";
import { IconClose, IconMenu } from "./icons";
import { PUBLIC_NAV } from "@/lib/nav";
import { goToSection as scrollToSection, scrollToId } from "@/lib/scroll";

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState<string>("accueil");

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      if (pathname === "/" && window.scrollY < 80) {
        setActive("accueil");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;

    const ids = ["accueil", ...PUBLIC_NAV.map((item) => item.id)];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target.id) setActive(visible.target.id);
      },
      { rootMargin: "-28% 0px -58% 0px", threshold: [0.1, 0.25, 0.5] },
    );

    ids.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (pathname !== "/") return;
    const id = window.location.hash.replace(/^#/, "");
    if (!id) return;
    const run = () => scrollToId(id);
    const frame = window.requestAnimationFrame(run);
    const timer = window.setTimeout(run, 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, [pathname]);

  function goToSection(
    event: MouseEvent<HTMLAnchorElement>,
    id: string,
  ) {
    scrollToSection(event, id);
    if (pathname === "/") {
      setActive(id);
      setOpen(false);
    }
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-line/80 bg-white/90 shadow-[0_8px_30px_rgba(7,29,68,0.06)] backdrop-blur-md"
          : "border-b border-transparent bg-white/80 backdrop-blur-sm"
      }`}
    >
      <div className="site-bar flex h-[80px] items-center justify-between gap-4 px-8 sm:px-10 lg:px-14 xl:px-16 min-[1920px]:px-0">
        <Link
          href="/#accueil"
          className="shrink-0"
          onClick={(event) => goToSection(event, "accueil")}
        >
          <Image
            src="/brand/logo-transparent.png"
            alt="Vertical Conseil — Ascenseur"
            width={400}
            height={128}
            className="h-[60px] w-auto sm:h-[64px] xl:h-[70px]"
            priority
            unoptimized
          />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-10 text-[15px] font-semibold text-navy lg:flex xl:gap-14 xl:text-[16px]">
          {PUBLIC_NAV.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={(event) => goToSection(event, item.id)}
              className={`relative whitespace-nowrap pb-1 transition-colors hover:text-brand ${
                pathname === "/" && active === item.id
                  ? "text-logo after:absolute after:inset-x-0 after:-bottom-0.5 after:h-[2px] after:bg-logo"
                  : "text-navy/80"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex xl:gap-3">
          <Link
            href="/connexion"
            className={`rounded-full border px-4 py-2 text-[14px] font-semibold transition xl:px-5 xl:text-[15px] ${
              pathname === "/connexion"
                ? "border-navy bg-soft text-navy"
                : "border-navy/20 text-navy hover:border-navy hover:bg-soft"
            }`}
          >
            Se connecter
          </Link>
          <Link
            href="/inscription"
            className="rounded-full bg-logo px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-navy xl:px-5 xl:text-[15px]"
          >
            Créer un compte
          </Link>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line text-navy lg:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <IconClose /> : <IconMenu />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-white/95 px-5 py-4 backdrop-blur lg:hidden">
          <nav className="page-wrap flex flex-col gap-3 text-[16px] font-semibold text-navy">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={active === item.id ? "text-brand" : ""}
                onClick={(event) => goToSection(event, item.id)}
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 md:hidden">
              <Link href="/connexion" onClick={() => setOpen(false)}>
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="inline-flex justify-center rounded-full bg-logo px-5 py-2 text-white"
                onClick={() => setOpen(false)}
              >
                Créer un compte
              </Link>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
