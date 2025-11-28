document.addEventListener("DOMContentLoaded", () => {
  /* SCROLL NAV */
  document.querySelectorAll("[data-scroll]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = document.querySelector(btn.dataset.scroll);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  /* MOCK MARKET DATA + CHART */

  const ASSETS = {
    sp500: {
      name: "S&P 500",
      tag: "Backbone actions US",
      comment:
        "Baromètre large des actions américaines. Sert souvent de cœur de portefeuille pour un investisseur long terme.",
      base: 5095,
      day: [+0.32, "positive"],
      month: [+3.8, "positive"],
      data: {
        "1D": [5090, 5098, 5085, 5102, 5095],
        "1M": [4950, 5000, 5040, 5070, 5095],
        "1Y": [4300, 4550, 4700, 4900, 5095],
      },
    },
    nasdaq: {
      name: "NASDAQ 100",
      tag: "Tech / croissance",
      comment:
        "Indice très exposé aux valeurs technologiques. Plus volatil, sensible aux taux et aux attentes de croissance.",
      base: 18045,
      day: [+0.61, "positive"],
      month: [+6.1, "positive"],
      data: {
        "1D": [17950, 18010, 17920, 18080, 18045],
        "1M": [17000, 17400, 17700, 17900, 18045],
        "1Y": [13500, 15000, 16200, 17300, 18045],
      },
    },
    cac40: {
      name: "CAC 40",
      tag: "Actions France",
      comment:
        "Indice des grandes valeurs françaises. Très sensible au luxe, aux banques et aux valeurs industrielles.",
      base: 7420,
      day: [+0.18, "positive"],
      month: [+2.9, "positive"],
      data: {
        "1D": [7380, 7410, 7395, 7430, 7420],
        "1M": [7200, 7270, 7320, 7380, 7420],
        "1Y": [6600, 6950, 7120, 7300, 7420],
      },
    },
    msciworld: {
      name: "MSCI World",
      tag: "ETF monde",
      comment:
        "Panier d’actions de pays développés. Produit passif utilisé comme socle d’un portefeuille diversifié.",
      base: 322,
      day: [+0.24, "positive"],
      month: [+3.2, "positive"],
      data: {
        "1D": [320.8, 321.5, 321.2, 322.4, 322.0],
        "1M": [311, 315, 318, 320, 322],
        "1Y": [280, 295, 305, 315, 322],
      },
    },
    btc: {
      name: "Bitcoin",
      tag: "Actif spéculatif",
      comment:
        "Actif très volatil. Chez FEIS, on le traite comme une poche spéculative limitée, jamais comme socle de portefeuille.",
      base: 68440,
      day: [+1.25, "positive"],
      month: [+12.3, "positive"],
      data: {
        "1D": [67500, 67900, 68200, 68700, 68440],
        "1M": [61000, 64000, 66000, 67500, 68440],
        "1Y": [23000, 35000, 47000, 59000, 68440],
      },
    },
    eth: {
      name: "Ethereum",
      tag: "Réseau / smart contracts",
      comment:
        "Token lié à un réseau. Volatil, dépendant du cycle crypto et de l’usage de la DeFi. Poche “laboratoire”, pas fondation.",
      base: 3905,
      day: [-0.8, "negative"],
      month: [+8.2, "positive"],
      data: {
        "1D": [3920, 3910, 3880, 3925, 3905],
        "1M": [3550, 3650, 3780, 3860, 3905],
        "1Y": [1600, 2200, 2800, 3400, 3905],
      },
    },
  };

  const tfButtons = document.querySelectorAll(".tf-btn");
  const canvas = document.getElementById("desk-chart");
  const ctx = canvas.getContext("2d");
  const assetNameEl = document.getElementById("asset-name");
  const assetTagEl = document.getElementById("asset-tag");
  const assetCommentEl = document.getElementById("asset-comment");

  let currentAsset = "sp500";
  let currentTf = "1M";

  /* ASSIGN MOCK VALUES TO LIST */
  function applyListValues() {
    Object.entries(ASSETS).forEach(([key, asset]) => {
      const valueField = document.querySelector(`[data-field="value-${key}"]`);
      const changeField = document.querySelector(`[data-field="change-${key}"]`);
      if (!valueField || !changeField) return;

      valueField.textContent = asset.base.toLocaleString("fr-FR", {
        maximumFractionDigits: key === "msciworld" ? 2 : 0,
      });

      const [pct, direction] = asset.day;
      changeField.textContent = `${pct.toFixed(2)} %`;
      changeField.classList.remove("positive", "negative");
      changeField.classList.add(direction);
    });
  }

  /* DRAW SIMPLE LINE CHART */
  function drawChartFor(assetKey, tf) {
    const asset = ASSETS[assetKey];
    if (!asset) return;

    const data = asset.data[tf];
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    // background
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, "#020617");
    bgGrad.addColorStop(1, "#020617");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = "rgba(148, 163, 184, 0.18)";
    ctx.lineWidth = 1;
    const gridLines = 4;
    for (let i = 1; i < gridLines; i++) {
      const y = (h / gridLines) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const paddingX = 32;
    const paddingY = 18;
    const span = max - min || 1;

    ctx.beginPath();
    data.forEach((val, index) => {
      const x =
        paddingX +
        ((w - paddingX * 2) * index) / Math.max(1, data.length - 1);
      const norm = (val - min) / span;
      const y = h - paddingY - norm * (h - paddingY * 2);

      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    const first = data[0];
    const last = data[data.length - 1];
    const lineUp = last >= first;

    const lineGrad = ctx.createLinearGradient(0, 0, w, 0);
    if (lineUp) {
      lineGrad.addColorStop(0, "#22c55e");
      lineGrad.addColorStop(1, "#06b6d4");
    } else {
      lineGrad.addColorStop(0, "#fb7185");
      lineGrad.addColorStop(1, "#f97316");
    }

    ctx.strokeStyle = lineGrad;
    ctx.lineWidth = 2;
    ctx.stroke();

    // area fill
    const areaGrad = ctx.createLinearGradient(0, paddingY, 0, h - paddingY);
    if (lineUp) {
      areaGrad.addColorStop(0, "rgba(34,197,94,0.25)");
      areaGrad.addColorStop(1, "rgba(15,23,42,0)");
    } else {
      areaGrad.addColorStop(0, "rgba(248,113,113,0.25)");
      areaGrad.addColorStop(1, "rgba(15,23,42,0)");
    }

    ctx.lineTo(w - paddingX, h - paddingY);
    ctx.lineTo(paddingX, h - paddingY);
    ctx.closePath();
    ctx.fillStyle = areaGrad;
    ctx.fill();

    // labels
    ctx.fillStyle = "#9ca3af";
    ctx.font = "11px system-ui";
    ctx.fillText(
      `Var ${tf}: ${
        tf === "1D"
          ? asset.day[0].toFixed(2)
          : tf === "1M"
          ? asset.month[0].toFixed(2)
          : asset.month[0].toFixed(2)
      } % (maquette)`,
      paddingX,
      paddingY + 4
    );
  }

  /* UPDATE VIEW */
  function updateDesk(assetKey, tf) {
    const asset = ASSETS[assetKey];
    if (!asset) return;

    currentAsset = assetKey;
    currentTf = tf;

    assetNameEl.textContent = asset.name;
    assetTagEl.textContent = asset.tag;
    assetCommentEl.textContent = asset.comment;

    document
      .querySelectorAll(".asset-row")
      .forEach((row) => row.classList.remove("active"));
    const activeRow = document.querySelector(`[data-asset="${assetKey}"]`);
    if (activeRow) activeRow.classList.add("active");

    drawChartFor(assetKey, tf);
  }

  applyListValues();
  updateDesk(currentAsset, currentTf);

  /* CLICK HANDLERS */
  document.querySelectorAll(".asset-row").forEach((row) => {
    row.addEventListener("click", () => {
      const asset = row.dataset.asset;
      if (!asset) return;
      updateDesk(asset, currentTf);
    });
  });

  tfButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const tf = btn.dataset.tf;
      if (!tf) return;
      tfButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      updateDesk(currentAsset, tf);
    });
  });

  /* QUESTIONS ACCORDION */
  document.querySelectorAll("[data-qa]").forEach((item) => {
    item.addEventListener("click", () => {
      const alreadyOpen = item.classList.contains("open");
      document
        .querySelectorAll("[data-qa]")
        .forEach((el) => el.classList.remove("open"));
      if (!alreadyOpen) item.classList.add("open");
    });
  });

  /* SCENARIO SLIDERS */
  const horizonInput = document.getElementById("horizon");
  const riskInput = document.getElementById("risk");
  const liquidityInput = document.getElementById("liquidity");
  const runBtn = document.getElementById("scenario-run");

  const horizonLabel = document.getElementById("horizon-label");
  const riskLabel = document.getElementById("risk-label");
  const liquidityLabel = document.getElementById("liquidity-label");

  const barCash = document.getElementById("bar-cash");
  const barBonds = document.getElementById("bar-bonds");
  const barEquity = document.getElementById("bar-equity");
  const barSpec = document.getElementById("bar-spec");

  const pctCash = document.getElementById("pct-cash");
  const pctBonds = document.getElementById("pct-bonds");
  const pctEquity = document.getElementById("pct-equity");
  const pctSpec = document.getElementById("pct-spec");

  function refreshLabels() {
    horizonLabel.textContent =
      horizonInput.value === "1"
        ? "≤ 3 ans"
        : horizonInput.value === "2"
        ? "5–10 ans"
        : "10 ans et +";

    riskLabel.textContent =
      riskInput.value === "1"
        ? "Faible"
        : riskInput.value === "2"
        ? "Modérée"
        : "Élevée";

    liquidityLabel.textContent =
      liquidityInput.value === "1"
        ? "Besoin rapide"
        : liquidityInput.value === "2"
        ? "Normal"
        : "Peu de besoin";
  }

  function runScenario() {
    const h = Number(horizonInput.value);
    const r = Number(riskInput.value);
    const l = Number(liquidityInput.value);

    let cash = 25;
    let bonds = 35;
    let equity = 35;
    let spec = 5;

    if (h === 1) {
      equity -= 10;
      cash += 10;
    } else if (h === 3) {
      equity += 10;
      cash -= 10;
    }

    if (r === 1) {
      equity -= 10;
      bonds += 10;
    } else if (r === 3) {
      equity += 10;
      bonds -= 5;
      spec += 5;
    }

    if (l === 1) {
      cash += 10;
      equity -= 5;
      bonds -= 5;
    } else if (l === 3) {
      cash -= 5;
      equity += 5;
    }

    const total = cash + bonds + equity + spec;
    cash = Math.round((cash / total) * 100);
    bonds = Math.round((bonds / total) * 100);
    equity = Math.round((equity / total) * 100);
    spec = Math.max(0, 100 - cash - bonds - equity);

    barCash.style.width = `${cash}%`;
    barBonds.style.width = `${bonds}%`;
    barEquity.style.width = `${equity}%`;
    barSpec.style.width = `${spec}%`;

    pctCash.textContent = `${cash}%`;
    pctBonds.textContent = `${bonds}%`;
    pctEquity.textContent = `${equity}%`;
    pctSpec.textContent = `${spec}%`;
  }

  [horizonInput, riskInput, liquidityInput].forEach((input) => {
    input.addEventListener("input", refreshLabels);
  });

  runBtn.addEventListener("click", () => {
    runScenario();
  });

  refreshLabels();
  runScenario();
});
