"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const { calcYearByYear } = require("../calc.js");

// Closed form for end-of-period contributions: P(1+i)^N + pmt * ((1+i)^N - 1) / i
function closedForm(P, monthly, ratePct, years, n) {
  const i = ratePct / 100 / n;
  const N = years * n;
  const pmt = monthly * (12 / n);
  if (i === 0) return P + pmt * N;
  return P * (1 + i) ** N + pmt * ((1 + i) ** N - 1) / i;
}

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} is not within ${eps} of ${b}`);

test("returns one entry per year", () => {
  const { balances, contributions } = calcYearByYear(1000, 100, 5, 7, 12);
  assert.equal(balances.length, 7);
  assert.equal(contributions.length, 7);
});

test("at 0% the balance equals the contributions", () => {
  const { balances, contributions } = calcYearByYear(1000, 100, 0, 10, 12);
  close(balances[9], 1000 + 100 * 12 * 10);
  close(balances[9], contributions[9]);
});

test("one year, no contributions, monthly compounding", () => {
  const { balances } = calcYearByYear(1000, 0, 5, 1, 12);
  close(balances[0], 1000 * (1 + 0.05 / 12) ** 12);
});

test("matches the closed-form formula for each compounding frequency", () => {
  for (const n of [12, 4, 1]) {
    const { balances } = calcYearByYear(5000, 200, 7, 20, n);
    close(balances[19], closedForm(5000, 200, 7, 20, n), 1e-6);
  }
});

test("total contributions are the deposit plus every monthly payment", () => {
  for (const n of [12, 4, 1]) {
    const { contributions } = calcYearByYear(5000, 200, 7, 20, n);
    close(contributions[19], 5000 + 200 * 12 * 20);
  }
});

test("balance never falls below contributions and never decreases", () => {
  const { balances, contributions } = calcYearByYear(2500, 75, 4.5, 30, 4);
  for (let y = 0; y < balances.length; y++) {
    assert.ok(balances[y] >= contributions[y] - 1e-9);
    if (y > 0) assert.ok(balances[y] > balances[y - 1]);
  }
});

test("zero deposit and zero contribution stays at zero", () => {
  const { balances } = calcYearByYear(0, 0, 7, 5, 12);
  assert.deepEqual(balances, [0, 0, 0, 0, 0]);
});

// The worked example on the page ($5,000 start, $200 a month, 7%, monthly compounding)
// must agree with the calculator, so the page text and the code cannot drift apart.
test("worked example on the page matches the calculator", () => {
  const { balances, contributions } = calcYearByYear(5000, 200, 7, 30, 12);
  const expected = { 10: [45000, 29000, 16000], 20: [124000, 53000, 71000], 30: [285000, 77000, 208000] };
  for (const [year, [bal, contrib, interest]] of Object.entries(expected)) {
    const b = balances[year - 1];
    const c = contributions[year - 1];
    assert.equal(Math.round(b / 1000) * 1000, bal, `balance after ${year} years`);
    assert.equal(Math.round(c / 1000) * 1000, contrib, `contributions after ${year} years`);
    assert.equal(Math.round((b - c) / 1000) * 1000, interest, `interest after ${year} years`);
  }
});
