export default class Calculator {
  private ids = {
    rate: "pay-rate",
    hours: "hours-worked",
    total: "weekly-total",
    button: "calculate-btn",
    reset: "reset-btn",
    breakdown: "breakdown-container",
  };

  private rateInput: HTMLInputElement | null;
  private hoursInput: HTMLInputElement | null;
  private totalInput: HTMLInputElement | null;
  private calculateButton: HTMLButtonElement | null;
  private resetButton: HTMLButtonElement | null;
  private breakdownContainer: HTMLElement | null; // ✅ FIX: був HTMLButtonElement → тепер HTMLElement
  private OVERTIME_LIMIT: number;
  private OVERTIME_MULTIPLIER: number;

  constructor(limit: number, multiplier: number) {
    this.rateInput = document.getElementById(this.ids.rate) as HTMLInputElement | null;
    this.hoursInput = document.getElementById(this.ids.hours) as HTMLInputElement | null;
    this.totalInput = document.getElementById(this.ids.total) as HTMLInputElement | null;
    this.calculateButton = document.getElementById(this.ids.button) as HTMLButtonElement | null;
    this.resetButton = document.getElementById(this.ids.reset) as HTMLButtonElement | null;
    this.breakdownContainer = document.getElementById(this.ids.breakdown) as HTMLElement | null; // ✅ FIX
    this.OVERTIME_LIMIT = limit;
    this.OVERTIME_MULTIPLIER = multiplier;

    if (!this.isReady()) return;
    this.init();
  }

  private isReady() {
    return (
      !!this.breakdownContainer &&
      !!this.rateInput &&
      !!this.hoursInput &&
      !!this.totalInput &&
      !!this.calculateButton &&
      !!this.resetButton
    );
  }

  private calculate = () => {
    const rate = parseFloat(this.rateInput!.value);
    const hours = parseFloat(this.hoursInput!.value);
    const total = parseFloat(this.totalInput!.value);

    let calculatedField: HTMLInputElement | null = null;

    if (this.isValid(rate) && this.isValid(hours)) {
      const { regularTotal, overtimeTotal, overtimeRate } = this.calculateTotal(rate, hours);
      this.totalInput!.value = (regularTotal + overtimeTotal).toFixed(2);
      this.renderBreakdown(rate, hours, regularTotal, overtimeRate, overtimeTotal);
      calculatedField = this.totalInput;
    } else if (this.isValid(rate) && this.isValid(total)) {
      const calculatedHours = this.calculateHours(rate, total);
      this.hoursInput!.value = calculatedHours.toFixed(2);
      const { regularTotal, overtimeTotal, overtimeRate } = this.calculateTotal(rate, calculatedHours);
      this.renderBreakdown(rate, calculatedHours, regularTotal, overtimeRate, overtimeTotal);
      calculatedField = this.hoursInput;
    } else if (this.isValid(hours) && this.isValid(total)) {
      const calculatedRate = this.calculateRate(hours, total);
      this.rateInput!.value = calculatedRate.toFixed(2);
      const { regularTotal, overtimeTotal, overtimeRate } = this.calculateTotal(calculatedRate, hours);
      this.renderBreakdown(calculatedRate, hours, regularTotal, overtimeRate, overtimeTotal);
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

  private renderBreakdown(
    rate: number,
    hours: number,
    regularTotal: number,
    overtimeRate: number,
    overtimeTotal: number
  ) {
    const regularHours = Math.min(hours, this.OVERTIME_LIMIT);
    const overtimeHours = Math.max(hours - this.OVERTIME_LIMIT, 0);
    const total = regularTotal + overtimeTotal;

    this.breakdownContainer!.innerHTML = `
      <div class="breakdown">
        <div class="breakdown__section">
          <div class="breakdown__row">
            <span>Pay Rate:</span>
            <strong>$${rate.toFixed(2)}</strong>
          </div>
          <div class="breakdown__row">
            <span>Regular Hours:</span>
            <strong>${regularHours.toFixed(2)}h</strong>
          </div>
          <div class="breakdown__row">
            <span>Regular Pay:</span>
            <strong>$${regularTotal.toFixed(2)}</strong>
          </div>
          <div class="breakdown__row">
            <span>Overtime Hours:</span>
            <strong>${overtimeHours.toFixed(2)}h</strong>
          </div>
          <div class="breakdown__row">
            <span>Overtime Rate:</span>
            <strong>$${overtimeHours > 0 ? overtimeRate.toFixed(2) : "0.00"}</strong>
          </div>
          <div class="breakdown__row">
            <span>Overtime Pay:</span>
            <strong>$${overtimeTotal.toFixed(2)}</strong>
          </div>
        </div>
        <div class="breakdown__footer">
          <div class="breakdown__row total">
            <span>Total Hours Worked:</span>
            <strong>${hours.toFixed(2)}h</strong>
          </div>
          <div class="breakdown__row total">
            <span>Weekly Total:</span>
            <strong>$${total.toFixed(2)}</strong>
          </div>
        </div>
      </div>
    `;
  }

  private unlockAllFields() {
    [this.rateInput, this.hoursInput, this.totalInput].forEach(input => {
      if (!input) return;
      input.disabled = false;
      input.classList.remove("highlight-result");
    });
    this.calculateButton!.disabled = false;
  }

  private calculateTotal(rate: number, hours: number) {
    const regularHours = Math.min(hours, this.OVERTIME_LIMIT);
    const overtimeHours = Math.max(hours - this.OVERTIME_LIMIT, 0);
    const regularTotal = regularHours * rate;
    const overtimeRate = rate * this.OVERTIME_MULTIPLIER;
    const overtimeTotal = overtimeHours * overtimeRate;

    return { regularTotal, overtimeTotal, overtimeRate };
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
    this.breakdownContainer!.innerHTML = "";
  };

  private monitorInputs = () => {
    const inputs = [this.rateInput!, this.hoursInput!, this.totalInput!];

    inputs.forEach(currentInput => {
      currentInput.addEventListener("input", () => {
        const filled = inputs.filter(input => input.value.trim() !== "");
        inputs.forEach(input => {
          input.disabled = filled.length >= 2 && !filled.includes(input);
        });
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

      input.addEventListener("input", () => {
        if (input.disabled) this.reset();
      });
    });

    this.calculateButton!.addEventListener("click", () => this.calculate());
    this.resetButton!.addEventListener("click", () => this.reset());
    this.monitorInputs();
  }
}
