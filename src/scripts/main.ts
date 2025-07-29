import "../styles/main.scss";
import Calculator from "./components/Calculator";

document.addEventListener("DOMContentLoaded", (): void => {
  const calculatorNode = document.getElementById("rate-calculator") as HTMLElement;
  if (calculatorNode) {
    const { overtimeLimit, overtimeMultiplayer } = calculatorNode.dataset;
    new Calculator(Number(overtimeLimit), Number(overtimeMultiplayer));
  }
});
