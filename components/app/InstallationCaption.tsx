import {
  displayAddress,
  displayReference,
} from "@/lib/installation-display";

export function InstallationCaption({
  address,
  reference,
  as = "p",
}: {
  address?: string | null;
  reference?: string | null;
  as?: "h1" | "p";
}) {
  const title = displayAddress({ buildingAddress: address });
  const ref = displayReference({ internalRef: reference });
  if (as === "h1") {
    return (
      <>
        <h1 className="mt-2 text-3xl font-semibold text-navy">{title}</h1>
        {ref ? <p className="mt-1 text-[15px] text-muted">{ref}</p> : null}
      </>
    );
  }
  return (
    <span className="block">
      <span className="block text-[14px] font-semibold whitespace-normal text-navy">
        {title}
      </span>
      {ref ? (
        <span className="mt-0.5 block text-[12px] font-normal text-muted">
          {ref}
        </span>
      ) : null}
    </span>
  );
}
