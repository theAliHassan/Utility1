"use strict";

/*
  Compound interest with regular contributions, calculated year by year so the
  chart can plot every year.

  Each year is n compounding periods. In every period the balance grows by
  r/n and then one period's worth of contributions (monthly x 12/n) is added at
  the END of that period. With annual compounding the twelve monthly
  contributions are therefore added together at year end, which slightly
  understates the result compared with true monthly deposits.

    P          initial deposit
    monthlyPMT monthly contribution
    annualRate annual rate in percent (7 means 7%)
    years      whole years
    n          compounding periods per year (12, 4 or 1)
*/
function calcYearByYear(P, monthlyPMT, annualRate, years, n) {
  const r = annualRate / 100;
  const rPerPeriod = r / n;
  const pmtPerPeriod = monthlyPMT * (12 / n);

  const balances = [];
  const contributions = [];

  let balance = P;
  let totalContrib = P;

  for (let year = 1; year <= years; year++) {
    for (let period = 0; period < n; period++) {
      balance = balance * (1 + rPerPeriod) + pmtPerPeriod;
      totalContrib += pmtPerPeriod;
    }
    balances.push(balance);
    contributions.push(totalContrib);
  }

  return { balances, contributions };
}

// Lets the same file load as a plain <script> in the browser and be require()d by the tests.
if (typeof module !== "undefined" && module.exports) {
  module.exports = { calcYearByYear };
}
