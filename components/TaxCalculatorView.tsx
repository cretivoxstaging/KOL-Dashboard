"use client";

export default function TaxCalculatorView() {
  const EXTERNAL_CALCULATOR_URL = "https://tax-kol-calculator.vercel.app/";

  return (
      <iframe 
        src={EXTERNAL_CALCULATOR_URL}
        className="w-full h-full"
        title="Tax Calculator"
      />
  );
}