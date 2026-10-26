export function ProLockedValue({
  locked,
  value,
}: {
  locked?: boolean;
  value: string;
}) {
  if (!locked) return <>{value}</>;
  return (
    <span className="inline-block select-none blur-[5px]" aria-hidden>
      ••••••••
    </span>
  );
}
