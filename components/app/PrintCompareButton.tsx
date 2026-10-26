"use client";

export function PrintCompareButton() {
  function printCompare() {
    document.body.classList.add("print-offer-compare");
    const cleanup = () => {
      document.body.classList.remove("print-offer-compare");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  }

  return (
    <button
      type="button"
      onClick={printCompare}
      className="inline-flex h-9 items-center rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-navy"
    >
      Imprimer le rapport
    </button>
  );
}
