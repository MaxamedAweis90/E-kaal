import React, { useState, useEffect } from "react";
import { useAppStore } from "../../store/useAppStore";
import { Icons } from "../icons";

export const CalculatorPopover: React.FC = () => {
  const { isCalculatorOpen, setCalculatorOpen } = useAppStore();
  const [display, setDisplay] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  const clearAll = () => {
    setDisplay("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const inputDigit = (digit: string) => {
    if (waitingForOperand) {
      setDisplay(digit);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === "0" ? digit : display + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplay("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!display.includes(".")) {
      setDisplay(display + ".");
    }
  };

  const performOperation = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const currentValue = prevValue || 0;
      let newValue = currentValue;

      if (operator === "+") newValue = currentValue + inputValue;
      else if (operator === "-") newValue = currentValue - inputValue;
      else if (operator === "*") newValue = currentValue * inputValue;
      else if (operator === "/") newValue = inputValue !== 0 ? currentValue / inputValue : 0;
      else if (operator === "%") newValue = (currentValue * inputValue) / 100;

      const rounded = Number(newValue.toFixed(4));
      setPrevValue(rounded);
      setDisplay(String(rounded));
    }

    setWaitingForOperand(true);
    setOperator(nextOperator === "=" ? null : nextOperator);
  };

  const toggleSign = () => {
    const value = parseFloat(display);
    setDisplay(String(-value));
  };

  // Keyboard navigation inside popover
  useEffect(() => {
    if (!isCalculatorOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= "0" && e.key <= "9") inputDigit(e.key);
      else if (e.key === ".") inputDecimal();
      else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/") performOperation(e.key);
      else if (e.key === "Enter" || e.key === "=") {
        e.preventDefault();
        performOperation("=");
      } else if (e.key === "Escape") setCalculatorOpen(false);
      else if (e.key === "Backspace") {
        if (!waitingForOperand) {
          setDisplay(display.length > 1 ? display.slice(0, -1) : "0");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCalculatorOpen, display, prevValue, operator, waitingForOperand]);

  if (!isCalculatorOpen) return null;

  return (
    <div className="fixed top-16 right-6 z-50 w-72 bg-surface border border-border rounded-modal shadow-2xl p-4 flex flex-col gap-3 font-sans backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Icons.Calculator className="w-4 h-4 text-primary" />
          <span className="text-xs font-semibold text-text uppercase tracking-wider">
            Quick Calc (Alt+C)
          </span>
        </div>
        <button
          onClick={() => setCalculatorOpen(false)}
          className="p-1 hover:bg-surface-2 rounded-btn text-muted hover:text-text transition-colors"
        >
          <Icons.Close className="w-4 h-4" />
        </button>
      </div>

      {/* LCD Display */}
      <div className="bg-[#000100] border border-border rounded-btn p-3 text-right">
        <div className="text-[10px] text-muted font-mono h-4">
          {operator && prevValue !== null ? `${prevValue} ${operator}` : ""}
        </div>
        <div className="text-2xl font-bold font-mono tracking-wider text-text truncate">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={clearAll}
          className="col-span-2 py-2 text-xs font-semibold rounded-btn bg-[#2b1616] text-[#f87171] hover:bg-[#3d1f1f] transition-colors"
        >
          CLEAR
        </button>
        <button
          onClick={toggleSign}
          className="py-2 text-xs font-semibold rounded-btn bg-surface-2 text-text hover:bg-border transition-colors"
        >
          +/-
        </button>
        <button
          onClick={() => performOperation("/")}
          className="py-2 text-sm font-semibold rounded-btn bg-primary-soft text-primary hover:bg-primary hover:text-black transition-colors"
        >
          ÷
        </button>

        {["7", "8", "9"].map((n) => (
          <button
            key={n}
            onClick={() => inputDigit(n)}
            className="py-2 text-sm font-medium rounded-btn bg-surface-2 text-text hover:bg-border transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => performOperation("*")}
          className="py-2 text-sm font-semibold rounded-btn bg-primary-soft text-primary hover:bg-primary hover:text-black transition-colors"
        >
          ×
        </button>

        {["4", "5", "6"].map((n) => (
          <button
            key={n}
            onClick={() => inputDigit(n)}
            className="py-2 text-sm font-medium rounded-btn bg-surface-2 text-text hover:bg-border transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => performOperation("-")}
          className="py-2 text-sm font-semibold rounded-btn bg-primary-soft text-primary hover:bg-primary hover:text-black transition-colors"
        >
          -
        </button>

        {["1", "2", "3"].map((n) => (
          <button
            key={n}
            onClick={() => inputDigit(n)}
            className="py-2 text-sm font-medium rounded-btn bg-surface-2 text-text hover:bg-border transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => performOperation("+")}
          className="py-2 text-sm font-semibold rounded-btn bg-primary-soft text-primary hover:bg-primary hover:text-black transition-colors"
        >
          +
        </button>

        <button
          onClick={() => inputDigit("0")}
          className="col-span-2 py-2 text-sm font-medium rounded-btn bg-surface-2 text-text hover:bg-border transition-colors"
        >
          0
        </button>
        <button
          onClick={inputDecimal}
          className="py-2 text-sm font-medium rounded-btn bg-surface-2 text-text hover:bg-border transition-colors"
        >
          .
        </button>
        <button
          onClick={() => performOperation("=")}
          className="py-2 text-sm font-bold rounded-btn bg-primary text-black hover:bg-accent transition-colors shadow-lg"
        >
          =
        </button>
      </div>
    </div>
  );
};
