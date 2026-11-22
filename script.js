/* ============================================================
   Utility1 — Compound Interest Calculator
   ============================================================ */

"use strict";

// ── Theme management ─────────────────────────────────────────

const themeToggle = document.getElementById("themeToggle");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
}

function initTheme() {
  const saved = localStorage.getItem("theme");
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  localStorage.setItem("theme", next);
});

// Also respond if the OS theme changes while the page is open
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem("theme")) {
    applyTheme(e.matches ? "dark" : "light");
  }
});

initTheme();


// ── DOM references ────────────────────────────────────────────

const inputs = {
  initialDeposit:      document.getElementById("initialDeposit"),
  monthlyContribution: document.getElementById("monthlyContribution"),
  annualRate:          document.getElementById("annualRate"),
  years:               document.getElementById("years"),
  compoundFrequency:   document.getElementById("compoundFrequency"),
};

const outputs = {
  finalBalance:        document.getElementById("finalBalance"),
  totalContributions:  document.getElementById("totalContributions"),
  totalInterest:       document.getElementById("totalInterest"),
  summaryNote:         document.getElementById("summaryNote"),
};


// ── Validation ───────────────────────────────────────────────

const rules = {
  initialDeposit:      { min: 0,   max: 1e9,  label: "Initial deposit" },
  monthlyContribution: { min: 0,   max: 1e7,  label: "Monthly contribution" },
  annualRate:          { min: 0,   max: 100,  label: "Annual rate" },
  years:               { min: 1,   max: 100,  label: "Number of years" },
};

function getErrorEl(id) {
  return document.getElementById(`${id}-error`);
}

function setError(id, message) {
  const field = inputs[id]?.closest(".field");
  const errorEl = getErrorEl(id);
  if (!field || !errorEl) return;
  if (message) {
    field.classList.add("field--error");
    errorEl.textContent = message;
  } else {
    field.classList.remove("field--error");
    errorEl.textContent = "";
  }
}

function validate() {
  let valid = true;
  for (const [id, rule] of Object.entries(rules)) {
    const raw = inputs[id].value.trim();
    const val = parseFloat(raw);

    if (raw === "" || isNaN(val)) {
      setError(id, `${rule.label} must be a number.`);
      valid = false;
    } else if (val < rule.min) {
      setError(id, `${rule.label} cannot be negative.`);
      valid = false;
    } else if (val > rule.max) {
      setError(id, `${rule.label} is too large (max ${rule.max.toLocaleString()}).`);
      valid = false;
    } else {
      setError(id, "");
    }
  }
  return valid;
}


// ── Core calculation ──────────────────────────────────────────

// calcYearByYear() lives in calc.js (loaded before this file) so the maths can be tested without a browser.


// ── Formatting ────────────────────────────────────────────────

function formatCurrency(value) {
  return "$" + value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatMult(ratio) {
  return ratio.toFixed(1) + "×";
}


// ── Chart setup ───────────────────────────────────────────────

function getChartColors() {
  const style = getComputedStyle(document.documentElement);
  return {
    balance:       style.getPropertyValue("--color-chart-balance").trim(),
    contributions: style.getPropertyValue("--color-chart-contributions").trim(),
    text:          style.getPropertyValue("--color-text-muted").trim(),
    grid:          style.getPropertyValue("--color-border").trim(),
    surface:       style.getPropertyValue("--color-surface").trim(),
  };
}

const ctx = document.getElementById("growthChart").getContext("2d");
let chart = null;

function buildChart(labels, balances, contributions) {
  const colors = getChartColors();

  const dataset = (label, data, color) => ({
    label,
    data,
    borderColor: color,
    backgroundColor: color + "22",  // 22 = ~13% alpha in hex
    borderWidth: 2.5,
    pointRadius: data.length > 40 ? 0 : 3,
    pointHoverRadius: 5,
    fill: false,
    tension: 0.35,
  });

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: "Year", color: colors.text, font: { size: 12 } },
        ticks: { color: colors.text, maxTicksLimit: 12 },
        grid:  { color: colors.grid },
      },
      y: {
        title: { display: true, text: "Amount (USD)", color: colors.text, font: { size: 12 } },
        ticks: {
          color: colors.text,
          callback: (val) => "$" + (val >= 1000 ? (val / 1000).toFixed(0) + "k" : val),
        },
        grid: { color: colors.grid },
      },
    },
  };

  if (chart) {
    chart.data.labels = labels;
    chart.data.datasets[0].data = balances;
    chart.data.datasets[0].borderColor = colors.balance;
    chart.data.datasets[0].backgroundColor = colors.balance + "22";
    chart.data.datasets[1].data = contributions;
    chart.data.datasets[1].borderColor = colors.contributions;
    chart.data.datasets[1].backgroundColor = colors.contributions + "22";
    chart.options.scales.x.ticks.color = colors.text;
    chart.options.scales.y.ticks.color = colors.text;
    chart.options.scales.x.grid.color = colors.grid;
    chart.options.scales.y.grid.color = colors.grid;
    chart.options.scales.x.title.color = colors.text;
    chart.options.scales.y.title.color = colors.text;
    chart.update();
    return;
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        dataset("Total Balance",       balances,      colors.balance),
        dataset("Your Contributions",  contributions, colors.contributions),
      ],
    },
    options,
  });
}


// ── Main update function ──────────────────────────────────────

function update() {
  if (!validate()) {
    outputs.finalBalance.textContent       = "—";
    outputs.totalContributions.textContent = "—";
    outputs.totalInterest.textContent      = "—";
    outputs.summaryNote.textContent        = "";
    return;
  }

  const P   = parseFloat(inputs.initialDeposit.value);
  const PMT = parseFloat(inputs.monthlyContribution.value);
  const r   = parseFloat(inputs.annualRate.value);
  const t   = parseInt(inputs.years.value, 10);
  const n   = parseInt(inputs.compoundFrequency.value, 10);

  const { balances, contributions } = calcYearByYear(P, PMT, r, t, n);

  const finalBalance      = balances[balances.length - 1];
  const totalContrib      = contributions[contributions.length - 1];
  const totalInterest     = finalBalance - totalContrib;

  outputs.finalBalance.textContent       = formatCurrency(finalBalance);
  outputs.totalContributions.textContent = formatCurrency(totalContrib);
  outputs.totalInterest.textContent      = formatCurrency(totalInterest);

  // Plain-English summary sentence
  if (totalContrib > 0 && finalBalance > totalContrib) {
    const mult = finalBalance / totalContrib;
    outputs.summaryNote.textContent =
      `After ${t} year${t === 1 ? "" : "s"}, every $1 you put in grew to ${formatMult(mult)}.`;
  } else if (r === 0) {
    outputs.summaryNote.textContent = "At 0% interest, your balance equals your contributions.";
  } else {
    outputs.summaryNote.textContent = "";
  }

  // Build year labels ("Yr 1", "Yr 2", …)
  const labels = Array.from({ length: t }, (_, i) => `Yr ${i + 1}`);

  buildChart(labels, balances, contributions);
}


// ── Debounce ─────────────────────────────────────────────────

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const debouncedUpdate = debounce(update, 200);


// ── Event listeners ───────────────────────────────────────────

for (const input of Object.values(inputs)) {
  input.addEventListener("input", debouncedUpdate);
}

// Re-draw chart with correct colors whenever theme changes
themeToggle.addEventListener("click", () => {
  if (chart) {
    // Small delay so CSS variables have updated
    setTimeout(update, 50);
  }
});


// ── Initial render ────────────────────────────────────────────

update();
