const HEADER_FALLBACK = 80;

const GAPS: Record<string, number> = {
  "a-propos": 12,
  fonctionnalites: 12,
  formules: 8,
  contact: 12,
  gerance: 12,
  ascensoristes: 12,
};

function headerHeight() {
  const header = document.querySelector("header");
  return header instanceof HTMLElement
    ? header.getBoundingClientRect().height
    : HEADER_FALLBACK;
}

function contentTop(node: HTMLElement, id: string) {
  const first = node.querySelector("h2, h3, p");
  if (first instanceof HTMLElement) {
    return window.scrollY + first.getBoundingClientRect().top;
  }
  const child = node.firstElementChild;
  if (child instanceof HTMLElement) {
    return window.scrollY + child.getBoundingClientRect().top;
  }
  return window.scrollY + node.getBoundingClientRect().top;
}

export function goToSection(
  event: { preventDefault: () => void },
  id: string,
) {
  if (typeof window === "undefined") return;
  if (window.location.pathname !== "/") return;
  if (!document.getElementById(id)) return;
  event.preventDefault();
  scrollToId(id);
  window.history.replaceState(null, "", `/#${id}`);
}

export function scrollToId(id: string) {
  if (id === "accueil") {
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  const node = document.getElementById(id);
  if (!node) return;

  if (id === "a-propos" || id === "contact") {
    const header = headerHeight();
    const top = Math.max(
      0,
      window.scrollY + node.getBoundingClientRect().top - header,
    );
    window.scrollTo({ top, behavior: "smooth" });
    return;
  }

  const gap = GAPS[id] ?? 12;
  const top = Math.max(0, contentTop(node, id) - headerHeight() - gap);
  const maxTop = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  window.scrollTo({ top: Math.min(maxTop, top), behavior: "smooth" });
}
