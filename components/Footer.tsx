import Image from "next/image";
import Link from "next/link";
import { AUDIENCE_NAV, PUBLIC_NAV } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-line bg-navy text-white">
      <div className="page-wrap grid gap-10 py-14 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Link href="/#accueil" className="inline-flex rounded-2xl bg-white px-3 py-2">
            <Image
              src="/brand/logo-transparent.png"
              alt="Vertical Conseil"
              width={400}
              height={128}
              className="h-14 w-auto sm:h-16"
              unoptimized
            />
          </Link>
          <p className="mt-5 max-w-sm text-[14px] leading-6 text-white/70">
            Plateforme indépendante de conseil, de gestion et d’appels d’offres
            pour ascenseurs en Suisse.
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
            Navigation
          </p>
          <ul className="mt-4 space-y-2 text-[14px]">
            {PUBLIC_NAV.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
            Espaces
          </p>
          <ul className="mt-3 space-y-2 text-[14px]">
            {AUDIENCE_NAV.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="text-white/80 hover:text-white">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/50">
            Vertical Conseil Sàrl
          </p>
          <p className="mt-4 text-[14px] leading-7 text-white/80">
            Rue du Molage 10b
            <br />
            1860 Aigle
            <br />
            <a href="mailto:info@vertical-conseil.ch" className="hover:text-white">
              info@vertical-conseil.ch
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-wrap flex flex-col gap-2 py-5 text-[12px] text-white/45 sm:flex-row sm:justify-between">
          <p>© 2026 Vertical Conseil Sàrl</p>
          <p>Données hébergées en Suisse · Plateforme indépendante</p>
        </div>
      </div>
    </footer>
  );
}
