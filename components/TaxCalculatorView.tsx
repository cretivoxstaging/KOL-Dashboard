"use client";

export default function TaxCalculatorView() {
  const EXTERNAL_CALCULATOR_URL = "https://tax-kol-calculator.vercel.app/";

  return (
    <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, position: 'relative', left: 'calc(-50vw + 50%)' }}>
      <iframe
        src={EXTERNAL_CALCULATOR_URL}
        style={{ width: '100vw', height: '100vh', border: 'none', margin: 0, padding: 0 }}
                            allow="clipboard-write"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-modals allow-popups allow-presentation allow-clipboard-write"
        title="Tax Calculator"
        allowFullScreen
      />
    </div>
  );
}