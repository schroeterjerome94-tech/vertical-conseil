"use client";

import { useState, type ReactNode } from "react";
import { formatChf, formatChf2, keepMoney, vatFromHt } from "@/lib/money";

const DISCOUNT_ROWS = [
  { id: "rabais", name: "rabaisPct", label: "Rabais %" },
  { id: "escompte", name: "escomptePct", label: "Escompte %" },
  { id: "prorata", name: "prorataPct", label: "Prorata %" },
] as const;

type DiscountId = (typeof DISCOUNT_ROWS)[number]["id"];

function formatInput(raw: string) {
  const value = keepMoney(raw);
  if (!value) return "";
  return formatChf(Number(value) || 0);
}

function keepAmount(value: string, maxWhole = 6) {
  const money = keepMoney(value);
  const [whole = "", cents] = money.split(".");
  const clipped = whole.slice(0, maxWhole);
  return cents != null ? `${clipped}.${cents.slice(0, 2)}` : clipped;
}

function keepPercent(value: string) {
  const whole = keepMoney(value).split(".")[0] ?? "";
  const digits = whole.replace(/\D/g, "").slice(0, 2);
  if (!digits) return "";
  return String(Math.min(99, Number(digits)));
}

function Line({
  label,
  minus,
  total,
  strong = false,
  children,
}: {
  label: string;
  minus?: string;
  total: string;
  strong?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-[7.25rem_7.5rem_auto_8.25rem] items-center gap-x-4 gap-y-2.5 py-2 ${
        strong ? "text-[16px] font-semibold text-navy" : "text-[14px] text-navy"
      }`}
    >
      <span>{label}</span>
      <div>{children}</div>
      <span
        className={`text-right tabular-nums ${
          minus?.startsWith("−") ? "text-muted" : "text-navy"
        }`}
      >
        {minus ?? ""}
      </span>
      <span className="text-right tabular-nums">{total}</span>
    </div>
  );
}

export function PriceWithVat({
  name,
  defaultValue,
  label = "Prix HT",
  emptyRed = false,
  className,
  discounts = false,
  defaultRabais,
  defaultEscompte,
  defaultProrata,
  defaultArrondi,
  maxWholeDigits = 6,
}: {
  name: string;
  defaultValue?: string;
  label?: string;
  emptyRed?: boolean;
  className?: string;
  discounts?: boolean;
  defaultRabais?: string;
  defaultEscompte?: string;
  defaultProrata?: string;
  defaultArrondi?: string;
  maxWholeDigits?: number;
}) {
  const [value, setValue] = useState(() =>
    formatInput(String(defaultValue ?? "")),
  );
  const [pct, setPct] = useState<Record<DiscountId, string>>({
    rabais: keepPercent(String(defaultRabais ?? "")),
    escompte: keepPercent(String(defaultEscompte ?? "")),
    prorata: keepPercent(String(defaultProrata ?? "")),
  });
  const [arrondi, setArrondi] = useState(() =>
    keepAmount(String(defaultArrondi ?? "")),
  );
  const parts = vatFromHt(
    value,
    discounts
      ? {
          rabais: pct.rabais,
          escompte: pct.escompte,
          prorata: pct.prorata,
          arrondi,
        }
      : undefined,
  );
  const showRed = emptyRed && !value.trim();
  const inputClass = `h-10 ${maxWholeDigits <= 5 ? "w-[6.75rem]" : "w-full"} rounded-xl border border-line bg-white px-3 text-[14px] font-normal tabular-nums outline-none focus:border-brand ${showRed ? "border-red-600 text-red-600" : ""}`;
  const htInputClass = `h-11 w-[7.5rem] rounded-xl border border-line px-2.5 text-[16px] font-semibold tabular-nums outline-none focus:border-brand ${showRed ? "border-red-600 text-red-600" : ""}`;

  if (!discounts) {
    return (
      <div className="grid gap-2">
        <label className="grid gap-1 text-[12px] font-semibold text-navy">
          {label}
          <input
            name={name}
            value={value}
            onChange={(event) =>
              setValue(keepAmount(event.target.value, maxWholeDigits))
            }
            onBlur={() => setValue(formatInput(value))}
            inputMode="decimal"
            autoComplete="off"
            className={inputClass}
          />
        </label>
        <p className="text-[14px] leading-6 text-muted">
          TVA 8,1 % :{" "}
          <span className="text-[16px] font-semibold tabular-nums text-navy">
            {formatChf(parts.vat)} CHF
          </span>
        </p>
        <p className="text-[14px] leading-6 text-muted">
          Prix TTC :{" "}
          <span className="text-[16px] font-semibold tabular-nums text-navy">
            {formatChf(parts.ttc)} CHF
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl">
      <div className="flex items-center justify-between gap-3 bg-soft px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
        <span>Dernières conditions</span>
        <span>Total</span>
      </div>
      <div>
        <Line label="Prix HT" total={`${formatChf(parts.ht)} CHF`}>
          <input
            name={name}
            value={value}
            onChange={(event) => setValue(keepAmount(event.target.value))}
            onBlur={() => setValue(formatInput(value))}
            inputMode="decimal"
            autoComplete="off"
            className={htInputClass}
          />
        </Line>
        {DISCOUNT_ROWS.map((row) => {
          const step = parts[row.id];
          return (
            <Line
              key={row.id}
              label={row.label}
              minus={`− ${formatChf(step.minus)} CHF`}
              total={`${formatChf(step.total)} CHF`}
            >
              <input
                name={row.name}
                value={pct[row.id]}
                onChange={(event) =>
                  setPct((current) => ({
                    ...current,
                    [row.id]: keepPercent(event.target.value),
                  }))
                }
                inputMode="numeric"
                maxLength={2}
                autoComplete="off"
                className="h-10 w-12 rounded-xl border border-line px-2 text-center text-[14px] tabular-nums outline-none focus:border-brand"
              />
            </Line>
          );
        })}
        <Line
          label="Arrondi"
          minus={`− ${formatChf(parts.arrondi.ht)} CHF`}
          total={`${formatChf(parts.arrondi.total)} CHF`}
        >
          <input
            name="arrondiHt"
            value={arrondi}
            onChange={(event) => setArrondi(keepAmount(event.target.value))}
            onBlur={() => setArrondi(formatInput(arrondi))}
            inputMode="decimal"
            autoComplete="off"
            className={htInputClass}
          />
        </Line>
        <div className="border-t border-line">
          <Line
            label="Net HT"
            total={`${formatChf(parts.net)} CHF`}
            strong
          />
          <Line
            label="TVA 8,1 %"
            minus={`+ ${formatChf2(parts.vat)} CHF`}
            total={`${formatChf(parts.ttc)} CHF`}
          />
          <Line
            label="Prix TTC"
            total={`${formatChf(parts.ttc)} CHF`}
            strong
          />
        </div>
      </div>
    </div>
  );
}
