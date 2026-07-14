const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const palette = ["#0f766e", "#e85d4f", "#f3b43f", "#3d7aa8", "#68a35c", "#d76f32", "#6a8fcb", "#c84b7a"];
const fullCircle = Math.PI * 2;

let groupMode = "count";
let wheelRotation = 0;
let lastWheelWinner = "";
let activePresenterTool = "";

const toolMap = {
  names: { title: "名單抽獎", resultId: "nameResult", action: () => drawNames() },
  wheel: { title: "幸運轉盤", resultId: "wheelResult", action: () => spinWheel() },
  numbers: { title: "數字抽獎", resultId: "numberResult", action: () => drawNumbers() },
  groups: { title: "隨機分組", resultId: "groupResult", action: () => makeGroups() },
  chance: { title: "機率抽獎", resultId: "chanceResult", action: () => drawChance() },
};

function linesFrom(textareaId) {
  return $(`#${textareaId}`).value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function shuffle(items) {
  const list = [...items];
  for (let index = list.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [list[index], list[target]] = [list[target], list[index]];
  }
  return list;
}

function normalizeAngle(angle) {
  return ((angle % fullCircle) + fullCircle) % fullCircle;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function setResult(target, items, emptyText = "沒有可顯示的結果") {
  const box = typeof target === "string" ? $(`#${target}`) : target;
  box.innerHTML = "";
  const list = Array.isArray(items) ? items : [items];

  if (!list.length) {
    box.textContent = emptyText;
    syncPresenter();
    return;
  }

  list.forEach((item) => {
    const element = document.createElement("span");
    element.className = "result-item";
    element.textContent = item;
    box.appendChild(element);
  });
  syncPresenter();
}

function plainTextFrom(element) {
  return element.innerText.trim();
}

function sampleItems(items, count = 1) {
  if (!items.length) return [];
  return Array.from({ length: count }, () => items[Math.floor(Math.random() * items.length)]);
}

function markFinal(resultId) {
  const box = $(`#${resultId}`);
  box.classList.remove("is-drawing");
  box.classList.add("is-final");
  window.setTimeout(() => box.classList.remove("is-final"), 420);
  $("#presenterResult")?.classList.remove("is-drawing");
  $("#presenterResult")?.classList.add("is-final");
  window.setTimeout(() => $("#presenterResult")?.classList.remove("is-final"), 460);
}

function animateResult(resultId, pool, finalCallback, options = {}) {
  const box = $(`#${resultId}`);
  const count = Math.max(1, options.count || 1);
  const duration = options.duration || 900;
  const interval = options.interval || 90;
  const prefix = options.prefix || "";
  const start = performance.now();

  box.classList.remove("is-final");
  box.classList.add("is-drawing");
  $("#presenterResult")?.classList.remove("is-final");
  $("#presenterResult")?.classList.add("is-drawing");

  function tick(now) {
    const sample = sampleItems(pool, count).map((item, index) => (prefix ? `${index + 1}. ${item}` : item));
    setResult(resultId, sample.length ? sample : "抽選中...");

    if (now - start < duration) {
      window.setTimeout(() => requestAnimationFrame(tick), interval);
      return;
    }

    finalCallback();
    markFinal(resultId);
    syncPresenter();
  }

  requestAnimationFrame(tick);
}

function currentToolKey() {
  const panel = $(".tool-panel.active");
  return panel ? panel.id.replace("tool-", "") : "names";
}

function resultItemsFrom(resultElement) {
  const groupBlocks = [...resultElement.querySelectorAll(".group-block")];
  if (groupBlocks.length) {
    return groupBlocks.map((block) => {
      const title = block.querySelector("strong")?.innerText.trim() || "";
      return {
        type: "group",
        title,
        text: block.innerText.replace(title, "").trim(),
      };
    });
  }

  const items = [...resultElement.querySelectorAll(".result-item")]
    .map((item) => item.innerText.trim())
    .filter(Boolean);
  return items.length ? items : [resultElement.innerText.trim()].filter(Boolean);
}

function renderPresenterResult(toolKey) {
  const config = toolMap[toolKey];
  if (!config) return;

  const presenter = $("#presenter");
  const result = $(`#${config.resultId}`);
  const output = $("#presenterResult");
  const items = resultItemsFrom(result);

  $("#presenterTool").textContent = config.title;
  $("#presenterTitle").textContent = "全頁顯示";
  output.className = "presenter-result";
  output.innerHTML = "";

  presenter.classList.toggle("show-wheel", toolKey === "wheel");
  if (toolKey === "wheel") {
    $("#presenterWheel").style.backgroundImage = `url("${$("#wheelCanvas").toDataURL("image/png")}")`;
  }

  if (!items.length) {
    output.textContent = "尚未抽獎";
    return;
  }

  if (toolKey === "groups") {
    output.classList.add("presenter-groups");
    items.forEach((item) => {
      const block = document.createElement("div");
      block.className = "presenter-group";
      block.innerHTML = `<strong>${item.title}</strong>${item.text}`;
      output.appendChild(block);
    });
    return;
  }

  if (items.length > 1) {
    output.classList.add("presenter-list");
    items.forEach((item) => {
      const chip = document.createElement("div");
      chip.className = "presenter-chip";
      chip.textContent = item;
      output.appendChild(chip);
    });
    return;
  }

  output.textContent = items[0];
}

function syncPresenter() {
  if (!activePresenterTool) return;
  renderPresenterResult(activePresenterTool);
}

function openPresenter(toolKey = currentToolKey()) {
  activePresenterTool = toolKey;
  const presenter = $("#presenter");
  presenter.classList.add("open");
  presenter.setAttribute("aria-hidden", "false");
  document.body.classList.add("presenter-open");
  renderPresenterResult(toolKey);
  if (presenter.requestFullscreen) {
    presenter.requestFullscreen().catch(() => {});
  }
  $("#presenterStage").focus();
}

function closePresenter() {
  activePresenterTool = "";
  const presenter = $("#presenter");
  presenter.classList.remove("open", "show-wheel");
  presenter.setAttribute("aria-hidden", "true");
  document.body.classList.remove("presenter-open");
  if (document.fullscreenElement === presenter) {
    document.exitFullscreen().catch(() => {});
  }
}

function runPresenterDraw() {
  if (!activePresenterTool) return;
  toolMap[activePresenterTool]?.action();
}

function drawNames() {
  const names = linesFrom("nameList");
  const count = Math.max(1, Number($("#nameCount").value) || 1);
  const repeat = $("#nameRepeat").checked;

  if (!names.length) {
    setResult("nameResult", "請先輸入名單");
    return;
  }

  if (!repeat && count > names.length) {
    setResult("nameResult", `名單只有 ${names.length} 筆`);
    return;
  }

  const result = repeat
    ? Array.from({ length: count }, () => names[Math.floor(Math.random() * names.length)])
    : shuffle(names).slice(0, count);

  animateResult("nameResult", names, () => setResult("nameResult", result), { count, duration: 1000 });
}

function parseExcludedNumbers(value) {
  return new Set(
    value
      .split(/[,\s，]+/)
      .map((item) => Number(item.trim()))
      .filter((item) => Number.isFinite(item))
  );
}

function drawNumbers() {
  const start = Number($("#numStart").value);
  const end = Number($("#numEnd").value);
  const count = Math.max(1, Number($("#numCount").value) || 1);
  const excluded = parseExcludedNumbers($("#numExclude").value);

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end) {
    setResult("numberResult", "請確認數字範圍");
    return;
  }

  const pool = [];
  for (let number = start; number <= end; number += 1) {
    if (!excluded.has(number)) pool.push(number);
  }

  if (count > pool.length) {
    setResult("numberResult", `可抽號碼只有 ${pool.length} 個`);
    return;
  }

  const result = shuffle(pool).slice(0, count);
  if ($("#numSort").checked) result.sort((a, b) => a - b);
  animateResult("numberResult", pool.map(String), () => setResult("numberResult", result.map(String)), {
    count,
    duration: 950,
  });
}

function drawWheel() {
  const canvas = $("#wheelCanvas");
  const ctx = canvas.getContext("2d");
  const items = linesFrom("wheelList");
  const size = canvas.width;
  const center = size / 2;
  const radius = size / 2 - 14;

  ctx.clearRect(0, 0, size, size);

  if (!items.length) {
    ctx.fillStyle = "#eef3ef";
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, fullCircle);
    ctx.fill();
    ctx.fillStyle = "#667085";
    ctx.textAlign = "center";
    ctx.font = "700 24px sans-serif";
    ctx.fillText("請輸入項目", center, center);
    return;
  }

  const angle = fullCircle / items.length;
  ctx.save();
  ctx.translate(center, center);
  ctx.rotate(wheelRotation);

  items.forEach((item, index) => {
    const start = index * angle;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, radius, start, start + angle);
    ctx.closePath();
    ctx.fillStyle = palette[index % palette.length];
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.save();
    ctx.rotate(start + angle / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = "800 18px Microsoft JhengHei, sans-serif";
    ctx.fillText(item.slice(0, 8), radius - 22, 7);
    ctx.restore();
  });

  ctx.beginPath();
  ctx.arc(0, 0, 56, 0, fullCircle);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#18212f";
  ctx.lineWidth = 4;
  ctx.stroke();
  ctx.fillStyle = "#18212f";
  ctx.textAlign = "center";
  ctx.font = "900 20px Microsoft JhengHei, sans-serif";
  ctx.fillText("START", 0, 7);
  ctx.restore();
  syncPresenter();
}

function spinWheel() {
  if ($("#spinWheel").disabled) return;
  const items = linesFrom("wheelList");
  if (!items.length) {
    setResult("wheelResult", "請先輸入轉盤項目");
    drawWheel();
    return;
  }

  const winnerIndex = Math.floor(Math.random() * items.length);
  const angle = fullCircle / items.length;
  const pointerAngle = 0;
  const targetCenter = winnerIndex * angle + angle / 2;
  const extraTurns = 5 + Math.floor(Math.random() * 3);
  const startRotation = normalizeAngle(wheelRotation);
  const finalRotation = normalizeAngle(pointerAngle - targetCenter);
  const rotationDelta = normalizeAngle(finalRotation - startRotation) + fullCircle * extraTurns;
  const duration = 1800;
  const startTime = performance.now();

  lastWheelWinner = items[winnerIndex];
  $("#spinWheel").disabled = true;
  $(".wheel-wrap")?.classList.add("is-spinning");
  setResult("wheelResult", "旋轉中...");

  function animate(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    const ease = 1 - Math.pow(1 - progress, 3);
    wheelRotation = startRotation + rotationDelta * ease;
    drawWheel();

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      wheelRotation = finalRotation;
      setResult("wheelResult", lastWheelWinner);
      $("#spinWheel").disabled = false;
      $(".wheel-wrap")?.classList.remove("is-spinning");
      markFinal("wheelResult");
    }
  }

  requestAnimationFrame(animate);
}

function removeWheelWinner() {
  if (!lastWheelWinner) {
    showToast("目前沒有可移除的結果");
    return;
  }

  const items = linesFrom("wheelList");
  const index = items.indexOf(lastWheelWinner);
  if (index >= 0) {
    items.splice(index, 1);
    $("#wheelList").value = items.join("\n");
    lastWheelWinner = "";
    setResult("wheelResult", "已移除，請再次旋轉");
    drawWheel();
  }
}

function makeGroups() {
  const names = shuffle(linesFrom("groupList"));
  const value = Math.max(1, Number($("#groupValue").value) || 1);
  const resultBox = $("#groupResult");

  if (!names.length) {
    resultBox.textContent = "請先輸入名單";
    return;
  }

  const groupCount = groupMode === "count" ? Math.min(value, names.length) : Math.ceil(names.length / value);
  const groups = Array.from({ length: groupCount }, () => []);
  names.forEach((name, index) => groups[index % groupCount].push(name));

  animateResult(
    "groupResult",
    names,
    () => {
      resultBox.innerHTML = "";
      groups.forEach((group, index) => {
        const block = document.createElement("div");
        block.className = "group-block";
        block.innerHTML = `<strong>第 ${index + 1} 組</strong>${group.join("、")}`;
        resultBox.appendChild(block);
      });
      syncPresenter();
    },
    { count: Math.min(4, names.length), duration: 1000 }
  );
}

function prizeRows() {
  return $$("#prizeList .prize-row")
    .map((row) => {
      const [nameInput, chanceInput] = row.querySelectorAll("input");
      return {
        name: nameInput.value.trim(),
        chance: Number(chanceInput.value),
      };
    })
    .filter((prize) => prize.name && Number.isFinite(prize.chance) && prize.chance > 0);
}

function drawChance() {
  const prizes = prizeRows();
  const times = Math.max(1, Number($("#chanceTimes").value) || 1);
  const total = prizes.reduce((sum, prize) => sum + prize.chance, 0);

  if (!prizes.length || total <= 0) {
    setResult("chanceResult", "請先設定獎項");
    return;
  }

  const results = [];
  for (let index = 0; index < times; index += 1) {
    const hit = Math.random() * total;
    let cursor = 0;
    for (const prize of prizes) {
      cursor += prize.chance;
      if (hit <= cursor) {
        results.push(prize.name);
        break;
      }
    }
  }

  animateResult(
    "chanceResult",
    prizes.map((prize) => prize.name),
    () => {
      const weightText = total === 100 ? "" : `（目前總權重 ${total}%）`;
      setResult("chanceResult", results.map((item, index) => `${index + 1}. ${item}${index === 0 ? weightText : ""}`));
    },
    { count: times, duration: 950 }
  );
}

function addPrize(name = "", chance = 10) {
  const row = document.createElement("div");
  row.className = "prize-row";
  row.innerHTML = `
    <input type="text" value="${name}" aria-label="獎項名稱" />
    <input type="number" value="${chance}" min="0" step="0.1" aria-label="機率" />
    <span>%</span>
  `;
  $("#prizeList").appendChild(row);
}

function resetPrizes() {
  $("#prizeList").innerHTML = "";
  addPrize("一獎", 5);
  addPrize("二獎", 20);
  addPrize("安慰獎", 75);
  $("#chanceTimes").value = 1;
  setResult("chanceResult", "尚未抽獎");
}

function bindTabs() {
  $$(".tool-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tool = tab.dataset.tool;
      $$(".tool-tab").forEach((item) => item.classList.toggle("active", item === tab));
      $$(".tool-panel").forEach((panel) => panel.classList.toggle("active", panel.id === `tool-${tool}`));
      if (tool === "wheel") drawWheel();
    });
  });
}

function bindGroups() {
  $$(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      groupMode = button.dataset.groupMode;
      $$(".segment").forEach((item) => item.classList.toggle("active", item === button));
    });
  });
}

function bindPrivacyToggles() {
  $$(".privacy-check").forEach((checkbox) => {
    const panel = checkbox.closest(".tool-panel");
    panel.classList.toggle("is-private", !checkbox.checked);
    checkbox.addEventListener("change", () => {
      panel.classList.toggle("is-private", !checkbox.checked);
      showToast(checkbox.checked ? "已顯示資料" : "已隱藏資料");
    });
  });
}

function bindPresenter() {
  $$("[data-present]").forEach((button) => {
    button.addEventListener("click", () => openPresenter(button.dataset.present));
  });

  $("#closePresenter").addEventListener("click", (event) => {
    event.stopPropagation();
    closePresenter();
  });

  $("#presenterStage").addEventListener("click", () => runPresenterDraw());

  document.addEventListener("keydown", (event) => {
    if (!activePresenterTool) return;
    if (event.code === "Space") {
      event.preventDefault();
      runPresenterDraw();
    }
    if (event.code === "Escape") {
      event.preventDefault();
      closePresenter();
    }
  });

  document.addEventListener("fullscreenchange", () => {
    if (activePresenterTool && !document.fullscreenElement && $("#presenter").classList.contains("open")) {
      closePresenter();
    }
  });
}

function bindUtilityButtons() {
  $$("[data-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      $(`#${button.dataset.clear}`).value = "";
      showToast("已清除");
      drawWheel();
    });
  });

  $$("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = plainTextFrom($(`#${button.dataset.copy}`));
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        showToast("已複製結果");
      } catch {
        showToast("瀏覽器未允許複製");
      }
    });
  });
}

function init() {
  bindTabs();
  bindGroups();
  bindPrivacyToggles();
  bindPresenter();
  bindUtilityButtons();
  $("#drawNames").addEventListener("click", drawNames);
  $("#drawNumbers").addEventListener("click", drawNumbers);
  $("#spinWheel").addEventListener("click", spinWheel);
  $("#removeWheelWinner").addEventListener("click", removeWheelWinner);
  $("#makeGroups").addEventListener("click", makeGroups);
  $("#drawChance").addEventListener("click", drawChance);
  $("#addPrize").addEventListener("click", () => addPrize("新獎項", 10));
  $("#resetPrizes").addEventListener("click", resetPrizes);
  $("#clearNumbers").addEventListener("click", () => {
    $("#numStart").value = 1;
    $("#numEnd").value = 50;
    $("#numCount").value = 3;
    $("#numExclude").value = "";
    setResult("numberResult", "尚未抽號");
  });
  $("#wheelList").addEventListener("input", drawWheel);
  drawWheel();
}

document.addEventListener("DOMContentLoaded", init);
