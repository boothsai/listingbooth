'use client';

import { useState } from 'react';

/* ═══════════════════════════════════════════════════════
   INPUT COMPONENT — Reusable styled form field
   ═══════════════════════════════════════════════════════ */
function Field({ label, value, onChange, prefix, suffix, min, max, step, type = 'number' }: {
  label: string; value: number; onChange: (v: number) => void; prefix?: string; suffix?: string;
  min?: number; max?: number; step?: number; type?: string;
}) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '8px' }}>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', background: 'rgba(255,255,255,0.05)' }}>
        {prefix && <span style={{ padding: '0 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '15px', borderRight: '1px solid rgba(255,255,255,0.1)', height: '48px', display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.03)' }}>{prefix}</span>}
        <input type={type} value={value} onChange={e => onChange(Number(e.target.value))} min={min} max={max} step={step}
          style={{ flex: 1, border: 'none', outline: 'none', padding: '0 14px', height: '48px', fontSize: '16px', fontWeight: 700, color: 'white', background: 'transparent', width: '100%' }} />
        {suffix && <span style={{ padding: '0 14px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '14px' }}>{suffix}</span>}
      </div>
    </div>
  );
}

function ResultCard({ label, value, color = 'white' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '16px', padding: '20px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <p style={{ margin: '0 0 4px', fontSize: '11px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>{label}</p>
      <p style={{ margin: 0, fontSize: '28px', fontWeight: 900, color, letterSpacing: '-1px' }}>{value}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 1: MORTGAGE PAYMENT CALCULATOR
   ═══════════════════════════════════════════════════════ */
function MortgageCalc() {
  const [price, setPrice] = useState(850000);
  const [down, setDown] = useState(170000);
  const [rate, setRate] = useState(4.79);
  const [years, setYears] = useState(25);

  const principal = price - down;
  const monthlyRate = rate / 100 / 12;
  const n = years * 12;
  const monthly = monthlyRate > 0 ? principal * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1) : principal / n;
  const total = monthly * n;
  const totalInterest = total - principal;
  const downPct = ((down / price) * 100).toFixed(1);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Home Price" value={price} onChange={setPrice} prefix="$" min={50000} max={10000000} step={10000} />
        <Field label={`Down Payment (${downPct}%)`} value={down} onChange={setDown} prefix="$" min={0} max={price} step={5000} />
        <Field label="Interest Rate" value={rate} onChange={setRate} suffix="%" min={0.5} max={15} step={0.01} />
        <Field label="Amortization" value={years} onChange={setYears} suffix="yrs" min={5} max={30} step={5} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultCard label="Monthly Payment" value={`$${Math.round(monthly).toLocaleString()}`} />
        <ResultCard label="Total Interest" value={`$${Math.round(totalInterest).toLocaleString()}`} color="#da291c" />
        <ResultCard label="Total Cost" value={`$${Math.round(total).toLocaleString()}`} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 2: AFFORDABILITY CALCULATOR
   ═══════════════════════════════════════════════════════ */
function AffordabilityCalc() {
  const [income, setIncome] = useState(120000);
  const [debt, setDebt] = useState(500);
  const [downPayment, setDownPayment] = useState(100000);
  const [rate, setRate] = useState(4.79);

  const monthlyIncome = income / 12;
  const maxGDS = 0.32;
  const maxMonthlyHousing = monthlyIncome * maxGDS - debt;
  const monthlyRate = rate / 100 / 12;
  const n = 25 * 12;
  const maxMortgage = maxMonthlyHousing > 0 ? maxMonthlyHousing * (Math.pow(1 + monthlyRate, n) - 1) / (monthlyRate * Math.pow(1 + monthlyRate, n)) : 0;
  const maxHome = maxMortgage + downPayment;
  const gds = ((maxMonthlyHousing + debt) / monthlyIncome * 100).toFixed(1);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Annual Gross Income" value={income} onChange={setIncome} prefix="$" min={30000} max={1000000} step={5000} />
        <Field label="Monthly Debts" value={debt} onChange={setDebt} prefix="$" min={0} max={10000} step={50} />
        <Field label="Down Payment" value={downPayment} onChange={setDownPayment} prefix="$" min={0} max={5000000} step={5000} />
        <Field label="Interest Rate" value={rate} onChange={setRate} suffix="%" min={0.5} max={15} step={0.01} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ResultCard label="Max Home Price" value={`$${Math.round(maxHome).toLocaleString()}`} color="#059669" />
        <ResultCard label="GDS Ratio" value={`${gds}%`} color={Number(gds) > 32 ? '#da291c' : '#059669'} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 3: LAND TRANSFER TAX (ONTARIO)
   ═══════════════════════════════════════════════════════ */
function LandTransferTaxCalc() {
  const [price, setPrice] = useState(800000);
  const [firstTime, setFirstTime] = useState(false);
  const [toronto, setToronto] = useState(false);

  const ontarioCalc = (p: number) => {
    let tax = 0;
    if (p > 2000000) { tax += (p - 2000000) * 0.025; p = 2000000; }
    if (p > 400000) { tax += (p - 400000) * 0.02; p = 400000; }
    if (p > 250000) { tax += (p - 250000) * 0.015; p = 250000; }
    if (p > 55000) { tax += (p - 55000) * 0.01; p = 55000; }
    tax += p * 0.005;
    return tax;
  };

  const torontoCalc = (p: number) => {
    let tax = 0;
    if (p > 2000000) { tax += (p - 2000000) * 0.025; p = 2000000; }
    if (p > 400000) { tax += (p - 400000) * 0.02; p = 400000; }
    if (p > 55000) { tax += (p - 55000) * 0.01; p = 55000; }
    tax += p * 0.005;
    return tax;
  };

  const ontarioTax = ontarioCalc(price);
  const torontoTax = toronto ? torontoCalc(price) : 0;
  const firstTimeRebate = firstTime ? Math.min(ontarioTax, 4000) + (toronto ? Math.min(torontoTax, 4475) : 0) : 0;
  const totalTax = ontarioTax + torontoTax - firstTimeRebate;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Field label="Purchase Price" value={price} onChange={setPrice} prefix="$" min={50000} max={10000000} step={10000} />
      </div>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
        <button onClick={() => setFirstTime(!firstTime)} style={{ padding: '12px 24px', borderRadius: '100px', border: firstTime ? '2px solid #059669' : '1px solid rgba(255,255,255,0.1)', background: firstTime ? 'rgba(5,150,105,0.1)' : 'rgba(255,255,255,0.03)', color: firstTime ? '#059669' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
          {firstTime ? '✓' : '○'} First-Time Buyer
        </button>
        <button onClick={() => setToronto(!toronto)} style={{ padding: '12px 24px', borderRadius: '100px', border: toronto ? '2px solid #2563eb' : '1px solid rgba(255,255,255,0.1)', background: toronto ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.03)', color: toronto ? '#3b82f6' : 'rgba(255,255,255,0.5)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
          {toronto ? '✓' : '○'} City of Toronto
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultCard label="Ontario LTT" value={`$${Math.round(ontarioTax).toLocaleString()}`} />
        {toronto && <ResultCard label="Toronto MLT" value={`$${Math.round(torontoTax).toLocaleString()}`} />}
        {firstTime && <ResultCard label="Rebate" value={`-$${Math.round(firstTimeRebate).toLocaleString()}`} color="#059669" />}
        <ResultCard label="Total Tax" value={`$${Math.round(totalTax).toLocaleString()}`} color="#da291c" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 4: CMHC INSURANCE CALCULATOR
   ═══════════════════════════════════════════════════════ */
function CMHCCalc() {
  const [price, setPrice] = useState(750000);
  const [down, setDown] = useState(50000);

  const downPct = (down / price) * 100;
  let premiumRate = 0;
  if (downPct < 5) premiumRate = 0; // Not eligible
  else if (downPct < 10) premiumRate = 4.0;
  else if (downPct < 15) premiumRate = 3.1;
  else if (downPct < 20) premiumRate = 2.8;
  else premiumRate = 0; // Not required

  const mortgage = price - down;
  const premium = mortgage * (premiumRate / 100);
  const totalMortgage = mortgage + premium;
  const required = downPct < 20;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Home Price" value={price} onChange={setPrice} prefix="$" min={50000} max={1500000} step={10000} />
        <Field label={`Down Payment (${downPct.toFixed(1)}%)`} value={down} onChange={setDown} prefix="$" min={0} max={price} step={5000} />
      </div>
      <div style={{ padding: '16px 20px', borderRadius: '12px', background: required ? 'rgba(218,41,28,0.1)' : 'rgba(5,150,105,0.1)', border: `1px solid ${required ? 'rgba(218,41,28,0.2)' : 'rgba(5,150,105,0.2)'}`, marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: required ? '#da291c' : '#059669' }}>
          {required ? `CMHC insurance required — premium rate: ${premiumRate}%` : 'No CMHC insurance required (20%+ down payment)'}
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultCard label="Mortgage" value={`$${mortgage.toLocaleString()}`} />
        <ResultCard label="Insurance Premium" value={`$${Math.round(premium).toLocaleString()}`} color={required ? '#da291c' : '#059669'} />
        <ResultCard label="Total Mortgage" value={`$${Math.round(totalMortgage).toLocaleString()}`} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 5: RENT VS BUY ANALYZER
   ═══════════════════════════════════════════════════════ */
function RentVsBuyCalc() {
  const [rent, setRent] = useState(2500);
  const [price, setPrice] = useState(700000);
  const [down, setDown] = useState(140000);
  const [rate, setRate] = useState(4.79);
  const [appreciation, setAppreciation] = useState(3);

  const mortgage = price - down;
  const monthlyRate = rate / 100 / 12;
  const n = 25 * 12;
  const monthlyPayment = mortgage * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const monthlyOwnership = monthlyPayment + (price * 0.01 / 12) + 200; // tax + insurance approx
  const after5yrs = price * Math.pow(1 + appreciation / 100, 5);
  const equityGain = after5yrs - price;
  const rentCost5yr = rent * 60;
  const buyCost5yr = monthlyOwnership * 60;
  const buyAdvantage = equityGain - (buyCost5yr - rentCost5yr);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Monthly Rent" value={rent} onChange={setRent} prefix="$" min={500} max={10000} step={100} />
        <Field label="Purchase Price" value={price} onChange={setPrice} prefix="$" min={100000} max={5000000} step={10000} />
        <Field label="Down Payment" value={down} onChange={setDown} prefix="$" min={0} max={price} step={5000} />
        <Field label="Appreciation" value={appreciation} onChange={setAppreciation} suffix="%/yr" min={0} max={10} step={0.5} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <ResultCard label="Monthly Rent" value={`$${rent.toLocaleString()}`} color="#da291c" />
        <ResultCard label="Monthly Ownership" value={`$${Math.round(monthlyOwnership).toLocaleString()}`} color="#2563eb" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ResultCard label="5-Year Equity Gain" value={`$${Math.round(equityGain).toLocaleString()}`} color="#059669" />
        <ResultCard label="Buy Advantage (5yr)" value={`${buyAdvantage > 0 ? '+' : ''}$${Math.round(buyAdvantage).toLocaleString()}`} color={buyAdvantage > 0 ? '#059669' : '#da291c'} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 6: CLOSING COSTS ESTIMATOR
   ═══════════════════════════════════════════════════════ */
function ClosingCostsCalc() {
  const [price, setPrice] = useState(800000);

  const ltt = (() => {
    let p = price, tax = 0;
    if (p > 2000000) { tax += (p - 2000000) * 0.025; p = 2000000; }
    if (p > 400000) { tax += (p - 400000) * 0.02; p = 400000; }
    if (p > 250000) { tax += (p - 250000) * 0.015; p = 250000; }
    if (p > 55000) { tax += (p - 55000) * 0.01; p = 55000; }
    tax += p * 0.005;
    return tax;
  })();
  const legal = 2000;
  const inspection = 500;
  const titleInsurance = 350;
  const adjustment = price * 0.005;
  const total = ltt + legal + inspection + titleInsurance + adjustment;

  const items = [
    { label: 'Land Transfer Tax', amount: ltt },
    { label: 'Legal Fees', amount: legal },
    { label: 'Home Inspection', amount: inspection },
    { label: 'Title Insurance', amount: titleInsurance },
    { label: 'Adjustments (est.)', amount: adjustment },
  ];

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <Field label="Purchase Price" value={price} onChange={setPrice} prefix="$" min={50000} max={10000000} step={10000} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        {items.map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: 'white' }}>${Math.round(item.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <ResultCard label="Total Closing Costs" value={`$${Math.round(total).toLocaleString()}`} color="#da291c" />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 7: INVESTMENT PROPERTY ROI
   ═══════════════════════════════════════════════════════ */
function InvestmentROICalc() {
  const [price, setPrice] = useState(650000);
  const [down, setDown] = useState(130000);
  const [rent, setRent] = useState(2800);
  const [expenses, setExpenses] = useState(800);
  const [appreciation, setAppreciation] = useState(3);

  const mortgage = price - down;
  const monthlyRate = 4.79 / 100 / 12;
  const n = 25 * 12;
  const monthlyPayment = mortgage * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const monthlyCashFlow = rent - monthlyPayment - expenses;
  const annualCashFlow = monthlyCashFlow * 12;
  const capRate = ((rent * 12 - expenses * 12) / price * 100);
  const cashOnCash = (annualCashFlow / down * 100);
  const yr5Value = price * Math.pow(1 + appreciation / 100, 5);
  const totalReturn5yr = annualCashFlow * 5 + (yr5Value - price);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Purchase Price" value={price} onChange={setPrice} prefix="$" min={100000} max={5000000} step={10000} />
        <Field label="Down Payment" value={down} onChange={setDown} prefix="$" min={0} max={price} step={5000} />
        <Field label="Monthly Rent Income" value={rent} onChange={setRent} prefix="$" min={500} max={20000} step={100} />
        <Field label="Monthly Expenses" value={expenses} onChange={setExpenses} prefix="$" min={0} max={10000} step={50} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <ResultCard label="Monthly Cash Flow" value={`${monthlyCashFlow >= 0 ? '+' : ''}$${Math.round(monthlyCashFlow).toLocaleString()}`} color={monthlyCashFlow >= 0 ? '#059669' : '#da291c'} />
        <ResultCard label="Cap Rate" value={`${capRate.toFixed(1)}%`} color={capRate >= 5 ? '#059669' : '#da291c'} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <ResultCard label="Cash-on-Cash Return" value={`${cashOnCash.toFixed(1)}%`} color={cashOnCash >= 0 ? '#059669' : '#da291c'} />
        <ResultCard label="5-Year Total Return" value={`$${Math.round(totalReturn5yr).toLocaleString()}`} color="#059669" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 8: STRESS TEST CALCULATOR
   ═══════════════════════════════════════════════════════ */
function StressTestCalc() {
  const [price, setPrice] = useState(800000);
  const [down, setDown] = useState(160000);
  const [rate, setRate] = useState(4.79);

  const stressRate = Math.max(rate + 2, 5.25);
  const mortgage = price - down;
  const monthlyRate = rate / 100 / 12;
  const stressMonthlyRate = stressRate / 100 / 12;
  const n = 25 * 12;
  const normalPayment = mortgage * (monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
  const stressPayment = mortgage * (stressMonthlyRate * Math.pow(1 + stressMonthlyRate, n)) / (Math.pow(1 + stressMonthlyRate, n) - 1);
  const diff = stressPayment - normalPayment;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Home Price" value={price} onChange={setPrice} prefix="$" min={100000} max={5000000} step={10000} />
        <Field label="Down Payment" value={down} onChange={setDown} prefix="$" min={0} max={price} step={5000} />
        <Field label="Offered Rate" value={rate} onChange={setRate} suffix="%" min={1} max={15} step={0.01} />
      </div>
      <div style={{ padding: '16px 20px', borderRadius: '12px', background: 'rgba(218,41,28,0.1)', border: '1px solid rgba(218,41,28,0.15)', marginBottom: '20px' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#da291c' }}>
          OSFI Qualifying Rate: <strong>{stressRate.toFixed(2)}%</strong> (your rate + 2%, minimum 5.25%)
        </p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultCard label="Your Payment" value={`$${Math.round(normalPayment).toLocaleString()}`} color="#059669" />
        <ResultCard label="Stress Test Payment" value={`$${Math.round(stressPayment).toLocaleString()}`} color="#da291c" />
        <ResultCard label="Monthly Difference" value={`+$${Math.round(diff).toLocaleString()}`} color="#da291c" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 9: SELLER NET PROCEEDS
   ═══════════════════════════════════════════════════════ */
function SellerNetCalc() {
  const [salePrice, setSalePrice] = useState(900000);
  const [mortgageOwing, setMortgageOwing] = useState(450000);
  const [commissionPct, setCommissionPct] = useState(5.0);

  const commission = salePrice * (commissionPct / 100);
  const legal = 1500;
  const staging = 3000;
  const misc = 2000;
  const totalCosts = commission + legal + staging + misc;
  const netProceeds = salePrice - mortgageOwing - totalCosts;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Expected Sale Price" value={salePrice} onChange={setSalePrice} prefix="$" min={100000} max={10000000} step={10000} />
        <Field label="Mortgage Owing" value={mortgageOwing} onChange={setMortgageOwing} prefix="$" min={0} max={salePrice} step={5000} />
        <Field label="Commission" value={commissionPct} onChange={setCommissionPct} suffix="%" min={0} max={10} step={0.25} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {[
          { label: 'Agent Commission', amount: commission },
          { label: 'Legal Fees', amount: legal },
          { label: 'Staging & Prep', amount: staging },
          { label: 'Miscellaneous', amount: misc },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 16px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
            <span style={{ fontSize: '14px', fontWeight: 800, color: '#da291c' }}>-${Math.round(item.amount).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <ResultCard label="Your Net Proceeds" value={`$${Math.round(netProceeds).toLocaleString()}`} color={netProceeds > 0 ? '#059669' : '#da291c'} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOL 10: BREAK-EVEN PRICE CALCULATOR
   ═══════════════════════════════════════════════════════ */
function BreakEvenCalc() {
  const [purchasePrice, setPurchasePrice] = useState(700000);
  const [closingCosts, setClosingCosts] = useState(25000);
  const [renovations, setRenovations] = useState(30000);
  const [holdingMonths, setHoldingMonths] = useState(6);
  const [monthlyCost, setMonthlyCost] = useState(3500);

  const totalInvested = purchasePrice + closingCosts + renovations + (holdingMonths * monthlyCost);
  const sellingCosts = totalInvested * 0.06; // ~6% for commission + legal
  const breakEven = totalInvested + sellingCosts;
  const profit10 = breakEven * 1.10;

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <Field label="Purchase Price" value={purchasePrice} onChange={setPurchasePrice} prefix="$" min={50000} max={5000000} step={10000} />
        <Field label="Closing Costs" value={closingCosts} onChange={setClosingCosts} prefix="$" min={0} max={200000} step={1000} />
        <Field label="Renovation Budget" value={renovations} onChange={setRenovations} prefix="$" min={0} max={500000} step={5000} />
        <Field label="Holding Period" value={holdingMonths} onChange={setHoldingMonths} suffix="mo" min={1} max={36} step={1} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <ResultCard label="Total Invested" value={`$${Math.round(totalInvested).toLocaleString()}`} />
        <ResultCard label="Break-Even Price" value={`$${Math.round(breakEven).toLocaleString()}`} color="#da291c" />
        <ResultCard label="10% Profit Target" value={`$${Math.round(profit10).toLocaleString()}`} color="#059669" />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   TOOLS DATA & MAIN COMPONENT
   ═══════════════════════════════════════════════════════ */

const TOOLS = [
  { id: 'mortgage', name: 'Mortgage Calculator', category: 'Buyers', desc: 'Calculate your monthly mortgage payment, total interest, and amortization cost.', Component: MortgageCalc, color: '#da291c' },
  { id: 'affordability', name: 'Affordability Calculator', category: 'Buyers', desc: 'Find out the maximum home price you can afford based on GDS ratio guidelines.', Component: AffordabilityCalc, color: '#059669' },
  { id: 'ltt', name: 'Land Transfer Tax', category: 'Buyers', desc: 'Ontario and Toronto municipal land transfer tax with first-time buyer rebates.', Component: LandTransferTaxCalc, color: '#2563eb' },
  { id: 'cmhc', name: 'CMHC Insurance', category: 'Buyers', desc: 'Calculate your mortgage default insurance premium required by CMHC.', Component: CMHCCalc, color: '#7c3aed' },
  { id: 'closing', name: 'Closing Costs', category: 'Buyers', desc: 'Full breakdown of every cost you need to budget for on closing day.', Component: ClosingCostsCalc, color: '#0891b2' },
  { id: 'stress', name: 'Mortgage Stress Test', category: 'Buyers', desc: 'See if you can qualify at the OSFI mandated stress test rate.', Component: StressTestCalc, color: '#dc2626' },
  { id: 'rentvsbuy', name: 'Rent vs. Buy', category: 'Buyers', desc: 'Compare the 5-year financial outcome of renting versus buying.', Component: RentVsBuyCalc, color: '#9333ea' },
  { id: 'roi', name: 'Investment ROI', category: 'Investors', desc: 'Analyze cap rate, cash-on-cash return, and 5-year total return on a rental property.', Component: InvestmentROICalc, color: '#059669' },
  { id: 'seller', name: 'Seller Net Proceeds', category: 'Sellers', desc: 'Calculate exactly how much you walk away with after selling your home.', Component: SellerNetCalc, color: '#f59e0b' },
  { id: 'breakeven', name: 'Break-Even Calculator', category: 'Investors', desc: 'For flippers and investors — find your break-even sale price and profit targets.', Component: BreakEvenCalc, color: '#e11d48' },
];

const CATEGORIES = ['All', 'Buyers', 'Sellers', 'Investors'];

export default function ToolsSection() {
  const [activeTool, setActiveTool] = useState(0);
  const [filter, setFilter] = useState('All');

  const filteredTools = filter === 'All' ? TOOLS : TOOLS.filter(t => t.category === filter);
  const current = TOOLS[activeTool];
  const ActiveComponent = current.Component;

  return (
    <section style={{ padding: '0 5% 120px' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        
        {/* Category Filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => { setFilter(cat); setActiveTool(TOOLS.findIndex(t => cat === 'All' || t.category === cat)); }} style={{
              padding: '10px 24px', borderRadius: '100px',
              border: filter === cat ? '2px solid #da291c' : '1px solid rgba(255,255,255,0.1)',
              background: filter === cat ? 'rgba(218,41,28,0.1)' : 'rgba(255,255,255,0.03)',
              color: filter === cat ? 'white' : 'rgba(255,255,255,0.5)',
              fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '32px' }}>
          
          {/* Left Sidebar: Tool Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filteredTools.map((tool) => {
              const idx = TOOLS.indexOf(tool);
              const isActive = idx === activeTool;
              return (
                <button key={tool.id} onClick={() => setActiveTool(idx)} style={{
                  padding: '20px', borderRadius: '16px', textAlign: 'left', cursor: 'pointer',
                  border: isActive ? `1px solid ${tool.color}44` : '1px solid rgba(255,255,255,0.05)',
                  background: isActive ? `${tool.color}11` : 'rgba(255,255,255,0.02)',
                  transition: 'all 0.2s',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? tool.color : 'rgba(255,255,255,0.2)' }} />
                    <span style={{ fontSize: '15px', fontWeight: 800, color: isActive ? 'white' : 'rgba(255,255,255,0.6)' }}>{tool.name}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: 'rgba(255,255,255,0.35)', fontWeight: 500, lineHeight: 1.4, paddingLeft: '20px' }}>{tool.desc}</p>
                  <span style={{ display: 'inline-block', marginTop: '8px', marginLeft: '20px', fontSize: '10px', fontWeight: 700, color: tool.color, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '3px 8px', borderRadius: '4px', background: `${tool.color}15` }}>{tool.category}</span>
                </button>
              );
            })}
          </div>

          {/* Right Panel: Active Tool */}
          <div style={{
            background: 'rgba(255,255,255,0.03)', borderRadius: '32px',
            border: '1px solid rgba(255,255,255,0.06)', padding: '48px',
            position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: 0, right: 0, width: '300px', height: '300px', background: `radial-gradient(circle, ${current.color}11 0%, transparent 70%)`, zIndex: 0 }} />
            <div style={{ position: 'relative', zIndex: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: current.color, boxShadow: `0 0 10px ${current.color}` }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: current.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{current.category}</span>
              </div>
              <h2 style={{ margin: '0 0 8px', fontSize: '32px', fontWeight: 900, color: 'white', letterSpacing: '-1px' }}>{current.name}</h2>
              <p style={{ margin: '0 0 32px', fontSize: '15px', color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>{current.desc}</p>
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
