export default class Calculator {
  private ids = {
    rate: "pay-rate",
    hours: "hours-worked",
    total: "weekly-total",
    button: "calculate-btn",
    reset: "reset-btn",
  };

  private rateInput: HTMLInputElement | null;
  private hoursInput: HTMLInputElement | null;
  private totalInput: HTMLInputElement | null;
  private calculateButton: HTMLButtonElement | null;
  private resetButton: HTMLButtonElement | null;
  private OVERTIME_LIMIT: number;
  private OVERTIME_MULTIPLIER: number;

  constructor(limit: number, multiplier: number) {
    this.rateInput = document.getElementById(this.ids.rate) as HTMLInputElement | null;
    this.hoursInput = document.getElementById(this.ids.hours) as HTMLInputElement | null;
    this.totalInput = document.getElementById(this.ids.total) as HTMLInputElement | null;
    this.calculateButton = document.getElementById(this.ids.button) as HTMLButtonElement | null;
    this.resetButton = document.getElementById(this.ids.reset) as HTMLButtonElement | null;
    this.OVERTIME_LIMIT = limit;
    this.OVERTIME_MULTIPLIER = multiplier;

    if (!this.isReady()) return;
    this.init();
  }

  private isReady() {
    return !!this.rateInput && !!this.hoursInput && !!this.totalInput && !!this.calculateButton && !!this.resetButton;
  }

  private calculate = () => {
    const rate = parseFloat(this.rateInput!.value);
    const hours = parseFloat(this.hoursInput!.value);
    const total = parseFloat(this.totalInput!.value);

    let calculatedField: HTMLInputElement | null = null;

    if (this.isValid(rate) && this.isValid(hours)) {
      this.totalInput!.value = this.calculateTotal(rate, hours).toFixed(2);
      calculatedField = this.totalInput;
    } else if (this.isValid(rate) && this.isValid(total)) {
      this.hoursInput!.value = this.calculateHours(rate, total).toFixed(2);
      calculatedField = this.hoursInput;
    } else if (this.isValid(hours) && this.isValid(total)) {
      this.rateInput!.value = this.calculateRate(hours, total).toFixed(2);
      calculatedField = this.rateInput;
    } else {
      return;
    }

    this.clearZeros();
    this.lockAllFields(calculatedField!);
    this.calculateButton!.disabled = true;
  };

  private lockAllFields(resultField: HTMLInputElement) {
    [this.rateInput, this.hoursInput, this.totalInput].forEach(input => {
      if (!input) return;
      input.disabled = true;
      input.classList.remove("highlight-result");
    });
    resultField.classList.add("highlight-result");
  }

  private unlockAllFields() {
    [this.rateInput, this.hoursInput, this.totalInput].forEach(input => {
      if (!input) return;
      input.disabled = false;
      input.classList.remove("highlight-result");
    });
    this.calculateButton!.disabled = false;
  }

  private calculateTotal(rate: number, hours: number): number {
    const regularHours = Math.min(hours, this.OVERTIME_LIMIT);
    const overtimeHours = Math.max(hours - this.OVERTIME_LIMIT, 0);
    return regularHours * rate + overtimeHours * rate * this.OVERTIME_MULTIPLIER;
  }

  private calculateHours(rate: number, total: number): number {
    const maxRegularPay = rate * this.OVERTIME_LIMIT;
    if (total <= maxRegularPay) {
      return total / rate;
    } else {
      const overtimePart = total - maxRegularPay;
      const overtimeHours = overtimePart / (rate * this.OVERTIME_MULTIPLIER);
      return this.OVERTIME_LIMIT + overtimeHours;
    }
  }

  private calculateRate(hours: number, total: number): number {
    const regularHours = Math.min(hours, this.OVERTIME_LIMIT);
    const overtimeHours = Math.max(hours - this.OVERTIME_LIMIT, 0);
    return total / (regularHours + overtimeHours * this.OVERTIME_MULTIPLIER);
  }

  private isValid(value: number) {
    return !isNaN(value) && value > 0;
  }

  private clearZeros() {
    [this.rateInput, this.hoursInput, this.totalInput].forEach(input => {
      if (input && (input.value === "0" || input.value === "0.00")) {
        input.value = "";
      }
    });
  }

  private reset = () => {
    this.rateInput!.value = "";
    this.hoursInput!.value = "";
    this.totalInput!.value = "";
    this.unlockAllFields();
  };

  private monitorInputs = () => {
    const inputs = [this.rateInput!, this.hoursInput!, this.totalInput!];

    inputs.forEach(currentInput => {
      currentInput.addEventListener("input", () => {
        const filledInputs = inputs.filter(input => input.value.trim() !== "");
        if (filledInputs.length >= 2) {
          inputs.forEach(input => {
            if (!filledInputs.includes(input)) {
              input.disabled = true;
            }
          });
        } else {
          inputs.forEach(input => (input.disabled = false));
        }
      });
    });
  };

  private init() {
    [this.rateInput, this.hoursInput, this.totalInput].forEach(input => {
      if (!input) return;
      input.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "-" || e.key.toLowerCase() === "e") {
          e.preventDefault();
        }
      });
    });

    this.calculateButton!.addEventListener("click", () => this.calculate());
    this.resetButton!.addEventListener("click", () => this.reset());
    this.monitorInputs();
  }
}
