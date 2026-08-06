import * as React from "react";

import { Input } from "@/components/ui/input";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
}

function formatFromCents(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Input monetário pt-BR: o usuário digita dígitos e vê "1.250,50"; emite number. */
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const [text, setText] = React.useState(() => formatFromCents(Math.round(value * 100)));

    React.useEffect(() => {
      const cents = Math.round(value * 100);
      const current = Math.round((Number(text.replace(/\./g, "").replace(",", ".")) || 0) * 100);
      if (cents !== current) setText(formatFromCents(cents));
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const digits = event.target.value.replace(/\D/g, "").slice(0, 12);
      const cents = Number(digits || "0");
      setText(formatFromCents(cents));
      onChange(cents / 100);
    };

    return (
      <div className={className}>
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            R$
          </span>
          <Input
            {...props}
            ref={ref}
            inputMode="numeric"
            className="money pl-9"
            value={text}
            onChange={handleChange}
          />
        </div>
      </div>
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
