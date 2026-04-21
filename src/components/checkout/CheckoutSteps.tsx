import { Check } from "lucide-react";

interface Props {
  step: 1 | 2 | 3;
}

const steps = ["Cart", "Address", "Payment"];

export const CheckoutSteps = ({ step }: Props) => (
  <div className="flex items-center justify-center gap-2 sm:gap-4 py-6">
    {steps.map((label, i) => {
      const num = (i + 1) as 1 | 2 | 3;
      const done = num < step;
      const active = num === step;
      return (
        <div key={label} className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-smooth ${
                done
                  ? "bg-primary text-primary-foreground border-primary"
                  : active
                  ? "bg-primary/15 text-primary border-primary"
                  : "bg-muted text-muted-foreground border-border"
              }`}
            >
              {done ? <Check className="h-4 w-4" /> : num}
            </div>
            <span className={`text-xs sm:text-sm font-medium ${active || done ? "text-secondary" : "text-muted-foreground"}`}>{label}</span>
          </div>
          {i < steps.length - 1 && <div className={`h-0.5 w-8 sm:w-16 ${done ? "bg-primary" : "bg-border"}`} />}
        </div>
      );
    })}
  </div>
);
