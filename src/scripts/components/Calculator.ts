export default class Calculator {
  private ids = {
    rate: "pay-rate",
    hours: "hours-worked",
    total: "weekly-total",
  };

  private rateInput: HTMLInputElement | null;
  private hoursInput: HTMLInputElement | null;
  private totalInput: HTMLInputElement | null;
  private OVERTIME_LIMIT: number;
  private OVERTIME_MULTIPLIER: number;

  constructor(limit: number, multiplayer: number) {
    this.rateInput = document.getElementById(this.ids.rate) as HTMLInputElement | null;
    this.hoursInput = document.getElementById(this.ids.hours) as HTMLInputElement | null;
    this.totalInput = document.getElementById(this.ids.total) as HTMLInputElement | null;
    this.OVERTIME_LIMIT = limit;
    this.OVERTIME_MULTIPLIER = multiplayer;

    if (!this.isReady()) return;
    this.init();
  }

  private isReady() {
    return !!this.rateInput && !!this.hoursInput && !!this.totalInput;
  }

  private calculate = () => {
    const active = document.activeElement as HTMLInputElement | null;
    if (active && active.value.trim() === "") {
      [this.rateInput, this.hoursInput, this.totalInput].forEach(input => {
        if (input !== active) input!.value = "";
      });
      return;
    }

    const rate = Number(this.rateInput!.value);
    const hours = Number(this.hoursInput!.value);
    const total = Number(this.totalInput!.value);

    if (this.isTotalCalculate(rate, hours)) {
      this.totalInput!.value = this.calculateTotal(rate, hours).toFixed(0);
    } else if (this.isHoursCalculate(rate, total)) {
      this.hoursInput!.value = this.calculateHours(rate, total).toFixed(0);
    } else if (this.isRateCalculate(hours, total)) {
      this.rateInput!.value = this.calculateRate(hours, total).toFixed(0);
    }

    this.clearZeros();
  };

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

  private isTotalCalculate(rate: number, hours: number) {
    return this.isValid(rate) && this.isValid(hours) && document.activeElement !== this.totalInput;
  }
  private isHoursCalculate(rate: number, total: number) {
    return this.isValid(rate) && this.isValid(total) && document.activeElement !== this.hoursInput;
  }
  private isRateCalculate(hours: number, total: number) {
    return this.isValid(hours) && this.isValid(total) && document.activeElement !== this.rateInput;
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

  private init() {
    [this.rateInput, this.hoursInput, this.totalInput].forEach(input => {
      if (!input) return;

      input.addEventListener("input", (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (Number(target.value) < 0) {
          target.value = "";
        }
        this.calculate();
      });

      input.addEventListener("keydown", (e: KeyboardEvent) => {
        if (e.key === "-" || e.key.toLowerCase() === "e") {
          e.preventDefault();
        }
      });
    });
  }
}