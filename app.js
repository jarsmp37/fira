// =============================================================================
// app.js - Lógica Integral del Dashboard Reto AgroCebada FIRA 2026
// =============================================================================

document.addEventListener("DOMContentLoaded", () => {
  initTabs();
  initVideoPlayer();
  initStorytellingCharts();
  initTerritorialMap();
  initPredictionTable();
  initDedicatedPredictionMap();
});

// -----------------------------------------------------------------------------
// 1. GESTOR DE PESTAÑAS (TABS)
// -----------------------------------------------------------------------------
let mapTerritorial = null;
let mapPrediction = null;

function initTabs() {
  const tabButtons = document.querySelectorAll(".tab-btn");
  const tabPanes = document.querySelectorAll(".tab-pane");

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-tab");
      
      tabButtons.forEach(b => b.classList.remove("active"));
      tabPanes.forEach(p => p.classList.remove("active"));
      
      btn.classList.add("active");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }

      // Si el usuario cambia de pestaña, pausar video nativo para no dejar audio activo
      const nativeVid = document.getElementById("fira-native-video");
      if (nativeVid && targetId !== "tab-presentacion") {
        nativeVid.pause();
      }

      // Re-calcular tamaño de los mapas al mostrar su pestaña
      setTimeout(() => {
        if (targetId === "tab-territorial" && mapTerritorial) {
          mapTerritorial.invalidateSize();
        } else if (targetId === "tab-pred-map" && mapPrediction) {
          mapPrediction.invalidateSize();
        }
        window.dispatchEvent(new Event("resize"));
      }, 120);
    });
  });
}

// -----------------------------------------------------------------------------
// 1.1 REPRODUCTOR DE VIDEO (NATIVO HD + TOGGLE YOUTUBE IFRAME)
// -----------------------------------------------------------------------------
function initVideoPlayer() {
  const btnModeLocal = document.getElementById("btn-mode-local");
  const btnModeYt = document.getElementById("btn-mode-yt");
  const nativeVid = document.getElementById("fira-native-video");
  const ytIframe = document.getElementById("fira-yt-iframe");
  const statusBadge = document.getElementById("player-status-badge");
  const statusDesc = document.getElementById("player-status-desc");

  if (!btnModeLocal || !btnModeYt || !nativeVid || !ytIframe) return;

  btnModeLocal.addEventListener("click", () => {
    btnModeLocal.classList.add("active");
    btnModeYt.classList.remove("active");
    nativeVid.style.display = "block";
    ytIframe.style.display = "none";
    if (statusBadge) {
      statusBadge.className = "badge-success-indicator";
      statusBadge.textContent = "● Reproductor Nativo HD Activo";
    }
    if (statusDesc) {
      statusDesc.textContent = "Video oficial integrado localmente (cero dependencias de cookies ni Error 153).";
    }
  });

  btnModeYt.addEventListener("click", () => {
    btnModeYt.classList.add("active");
    btnModeLocal.classList.remove("active");
    nativeVid.pause();
    nativeVid.style.display = "none";
    ytIframe.style.display = "block";
    if (statusBadge) {
      statusBadge.className = "badge-yt-indicator";
      statusBadge.textContent = "● Modo YouTube IFrame";
    }
    if (statusDesc) {
      statusDesc.textContent = "Si tu navegador o política local muestra Error 153, regresa a Reproductor HD o pulsa Ver en YouTube.";
    }
  });
}

// -----------------------------------------------------------------------------
// 2. STORYTELLING & GRÁFICOS DE CONTRASTE (BAR CHARTS INTERACTIVOS)
// -----------------------------------------------------------------------------
function initStorytellingCharts() {
  if (typeof STORYTELLING_DATA === "undefined") return;

  // Pestaña 1: Ranking Comparativo de Índices Satelitales
  const ctx1 = document.getElementById("chart-sat-comparison");
  if (ctx1 && STORYTELLING_DATA.sat_comparison) {
    const dataSat = STORYTELLING_DATA.sat_comparison;
    new Chart(ctx1, {
      type: "bar",
      data: {
        labels: dataSat.labels,
        datasets: [{
          label: "Poder Predictivo (%)",
          data: dataSat.scores,
          backgroundColor: [
            "#166534", // Ganador oficial (verde FIRA)
            "#64748b", // EVI (gris azulado)
            "#d97706", // NDVI (ámbar - satura)
            "#94a3b8", // MSAVI (gris)
            "#cbd5e1", // LAI mean (gris claro)
            "#e2e8f0"  // NDVI mean (gris muy claro)
          ],
          borderColor: [
            "#14532d",
            "#475569",
            "#b45309",
            "#64748b",
            "#94a3b8",
            "#cbd5e1"
          ],
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const idx = ctx.dataIndex;
                const corr = dataSat.correlations[idx];
                const desc = dataSat.descriptions[idx];
                return [`Puntaje: ${ctx.raw}% | Correlación r: +${corr}`, `Diagnóstico: ${desc}`];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Capacidad de Anticipación del Rendimiento (%)", font: { weight: 700 } },
            min: 0,
            max: 100,
            ticks: { callback: (v) => v + "%" }
          },
          y: {
            ticks: { font: { weight: 600, family: "Plus Jakarta Sans" } }
          }
        }
      }
    });
  }

  // Pestaña 2: Ranking Bipolar de Variables Climáticas (Beneficio vs Daño)
  const ctx2 = document.getElementById("chart-climate-ranking");
  if (ctx2 && STORYTELLING_DATA.climate_ranking) {
    const dataClim = STORYTELLING_DATA.climate_ranking;
    new Chart(ctx2, {
      type: "bar",
      data: {
        labels: dataClim.labels,
        datasets: [{
          label: "Impacto en Cosecha (Correlación r)",
          data: dataClim.correlations,
          backgroundColor: dataClim.correlations.map(val => {
            if (val >= 0.40) return "#16a34a"; // Fuerte positivo (verde)
            if (val > 0) return "#86efac";    // Positivo leve
            if (val <= -0.40) return "#dc2626"; // Daño severo (rojo)
            if (val <= -0.20) return "#ea580c"; // Daño moderado (naranja)
            return "#cbd5e1";                   // Neutro (gris)
          }),
          borderColor: dataClim.correlations.map(val => val >= 0 ? "#14532d" : "#991b1b"),
          borderWidth: 1.5,
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const idx = ctx.dataIndex;
                const role = dataClim.roles[idx];
                const val = ctx.raw >= 0 ? `+${ctx.raw}` : `${ctx.raw}`;
                return [`Impacto: ${val}`, `Función: ${role}`];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "← Factor de Pérdida / Daño | Factor Favorable de Cosecha →", font: { weight: 700 } },
            min: -0.60,
            max: 0.70,
            ticks: {
              callback: (v) => (v > 0 ? `+${v}` : `${v}`)
            },
            grid: {
              color: (context) => (context.tick.value === 0 ? "#0f172a" : "#e2e8f0"),
              lineWidth: (context) => (context.tick.value === 0 ? 2 : 1)
            }
          },
          y: {
            ticks: { font: { weight: 600, family: "Plus Jakarta Sans" } }
          }
        }
      }
    });
  }

  // Pestaña 3A: Importancia de los 4 Pilares Biofísicos
  const ctx3A = document.getElementById("chart-pillars-importance");
  if (ctx3A && STORYTELLING_DATA.pillars_importance) {
    const dataPil = STORYTELLING_DATA.pillars_importance;
    new Chart(ctx3A, {
      type: "bar",
      data: {
        labels: dataPil.labels,
        datasets: [{
          label: "Aporte al Modelo (%)",
          data: dataPil.percentages,
          backgroundColor: [
            "#166534", // Pilar 1 (Verde FIRA)
            "#2563eb", // Pilar 2 (Azul)
            "#7c3aed", // Pilar 3 (Púrpura)
            "#d97706"  // Pilar 4 (Ámbar)
          ],
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `Aporte al modelo predictivo: ${ctx.raw}%`
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Porcentaje de Importancia Relativa (%)", font: { weight: 700 } },
            min: 0,
            max: 50,
            ticks: { callback: (v) => v + "%" }
          },
          y: {
            ticks: { font: { weight: 600, family: "Plus Jakarta Sans" } }
          }
        }
      }
    });
  }

  // Pestaña 3B: Semáforo de Duplicidad VIF (Variables Descartadas vs Seleccionadas)
  const ctx3B = document.getElementById("chart-vif-comparison");
  if (ctx3B && STORYTELLING_DATA.vif_comparison) {
    const dataVif = STORYTELLING_DATA.vif_comparison;
    new Chart(ctx3B, {
      type: "bar",
      data: {
        labels: dataVif.labels,
        datasets: [{
          label: "Factor VIF de Duplicidad",
          data: dataVif.vifs,
          backgroundColor: dataVif.vifs.map(v => {
            if (v >= 10.0) return "#ef4444"; // Alerta Roja (VIF >= 10)
            if (v >= 5.0) return "#f59e0b";  // Moderado (VIF 5-10)
            return "#16a34a";                 // Verde Limpio (VIF < 5)
          }),
          borderRadius: 6
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.raw;
                const diag = val >= 10 ? "Alerta Roja (Información muy duplicada)" : (val >= 5 ? "Repetición moderada" : "Limpio y Robusto");
                return [`VIF: ${val}`, `Diagnóstico: ${diag}`];
              }
            }
          }
        },
        scales: {
          x: {
            title: { display: true, text: "Factor de Inflación de Varianza (VIF) — Umbral de Alerta: 10.0", font: { weight: 700 } },
            min: 0,
            max: 18,
            grid: {
              color: (context) => (context.tick.value === 10 ? "#ef4444" : "#e2e8f0"),
              lineWidth: (context) => (context.tick.value === 10 ? 2 : 1)
            }
          },
          y: {
            ticks: { font: { weight: 600, family: "Plus Jakarta Sans" } }
          }
        }
      }
    });
  }
}

// -----------------------------------------------------------------------------
// 3. VISOR TERRITORIAL MULTIANUAL Y SEMANAL (GOOGLE MAPS CALLES)
// -----------------------------------------------------------------------------
let currentYear = "2025";
let currentWeekIdx = 19; // Semana 20 (pico de biomasa foliar de septiembre)
let currentVariable = "lai";
let isPlaying = false;
let playInterval = null;
let geojsonLayer = null;

function initTerritorialMap() {
  const mapElem = document.getElementById("map-territorial");
  if (!mapElem || typeof GEOJSON_DATA === "undefined") return;

  // Mapa centrado en la zona de estudio con Google Maps tipo CALLES (lyrs=m)
  mapTerritorial = L.map("map-territorial", {
    center: [19.78, -98.42],
    zoom: 10,
    zoomControl: true
  });

  // Capa Google Maps Calles Oficial (lyrs=m)
  L.tileLayer("https://mt0.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    attribution: "Google Maps | FIRA Banco de México"
  }).addTo(mapTerritorial);

  bindTerritorialControls();
  updateTerritorialLayer();
}

function bindTerritorialControls() {
  // Botones de Año
  const yearBtns = document.querySelectorAll(".year-btn");
  yearBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      yearBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentYear = btn.getAttribute("data-year");
      updateTerritorialLayer();
    });
  });

  // Radios de Variable
  const varRadios = document.querySelectorAll("input[name='var-layer']");
  varRadios.forEach(radio => {
    radio.addEventListener("change", (e) => {
      currentVariable = e.target.value;
      updateLegend();
      updateTerritorialLayer();
    });
  });

  // Slider de Semanas
  const slider = document.getElementById("timeline-slider");
  if (slider) {
    slider.addEventListener("input", (e) => {
      currentWeekIdx = parseInt(e.target.value);
      updateTimelineLabels();
      updateTerritorialLayer();
    });
  }

  // Botón Play / Pausa
  const playBtn = document.getElementById("btn-play-timeline");
  if (playBtn) {
    playBtn.addEventListener("click", () => {
      isPlaying = !isPlaying;
      if (isPlaying) {
        playBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`;
        playInterval = setInterval(() => {
          currentWeekIdx = (currentWeekIdx + 1) % WEEKS_METADATA.length;
          slider.value = currentWeekIdx;
          updateTimelineLabels();
          updateTerritorialLayer();
        }, 900);
      } else {
        clearInterval(playInterval);
        playBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>`;
      }
    });
  }

  updateTimelineLabels();
  updateLegend();
}

function updateTimelineLabels() {
  if (typeof WEEKS_METADATA === "undefined" || !WEEKS_METADATA[currentWeekIdx]) return;
  const meta = WEEKS_METADATA[currentWeekIdx];
  const labelElem = document.getElementById("timeline-week-label");
  const phaseElem = document.getElementById("timeline-phase-label");
  if (labelElem) labelElem.textContent = meta.label;
  if (phaseElem) phaseElem.textContent = meta.fase;
}

function updateLegend() {
  const legendTitle = document.getElementById("legend-title");
  const legendBar = document.getElementById("legend-bar");
  const legendMin = document.getElementById("legend-min");
  const legendMax = document.getElementById("legend-max");

  if (currentVariable === "lai") {
    if (legendTitle) legendTitle.textContent = "Índice LAI (Área Foliar m²/m²)";
    if (legendBar) legendBar.style.background = "linear-gradient(to right, #ffffcc, #78c679, #006837)";
    if (legendMin) legendMin.textContent = "0.0";
    if (legendMax) legendMax.textContent = "2.5+";
  } else if (currentVariable === "ndvi") {
    if (legendTitle) legendTitle.textContent = "Índice NDVI (Verdor Vegetativo)";
    if (legendBar) legendBar.style.background = "linear-gradient(to right, #d73027, #fee08b, #1a9850)";
    if (legendMin) legendMin.textContent = "0.10";
    if (legendMax) legendMax.textContent = "0.85";
  } else if (currentVariable === "prec") {
    if (legendTitle) legendTitle.textContent = "Precipitación Acumulada Semanal";
    if (legendBar) legendBar.style.background = "linear-gradient(to right, #f7fbff, #6baed6, #08306b)";
    if (legendMin) legendMin.textContent = "0 mm";
    if (legendMax) legendMax.textContent = "250 mm";
  } else if (currentVariable === "tmin") {
    if (legendTitle) legendTitle.textContent = "Temperatura Mínima Nocturna";
    if (legendBar) legendBar.style.background = "linear-gradient(to right, #313695, #abd9e9, #fdae61)";
    if (legendMin) legendMin.textContent = "8 °C";
    if (legendMax) legendMax.textContent = "18 °C";
  }
}

function getFeatureColor(feature) {
  const p = feature.properties;
  let val = 0;

  if (currentVariable === "lai" || currentVariable === "ndvi") {
    if (p.sat && p.sat[currentYear] && p.sat[currentYear][currentVariable]) {
      val = p.sat[currentYear][currentVariable][currentWeekIdx] ?? 0;
    }
  } else {
    if (p.clima && p.clima[currentYear] && p.clima[currentYear][currentVariable]) {
      val = p.clima[currentYear][currentVariable][currentWeekIdx] ?? 0;
    }
  }

  if (currentVariable === "lai") {
    if (val < 0.2) return "#ffffcc";
    if (val < 0.5) return "#c2e699";
    if (val < 0.9) return "#78c679";
    if (val < 1.4) return "#31a354";
    return "#006837";
  } else if (currentVariable === "ndvi") {
    if (val < 0.25) return "#d73027";
    if (val < 0.40) return "#fdae61";
    if (val < 0.55) return "#fee08b";
    if (val < 0.70) return "#a6d96a";
    return "#1a9850";
  } else if (currentVariable === "prec") {
    if (val < 40) return "#f7fbff";
    if (val < 90) return "#c6dbef";
    if (val < 150) return "#6baed6";
    if (val < 220) return "#2171b5";
    return "#08306b";
  } else if (currentVariable === "tmin") {
    if (val < 11.5) return "#313695";
    if (val < 12.8) return "#74add1";
    if (val < 14.0) return "#e0f3f8";
    if (val < 15.0) return "#fdae61";
    return "#f46d43";
  }

  return "#166534";
}

function updateTerritorialLayer() {
  if (!mapTerritorial || typeof GEOJSON_DATA === "undefined") return;

  if (geojsonLayer) {
    mapTerritorial.removeLayer(geojsonLayer);
  }

  geojsonLayer = L.geoJSON(GEOJSON_DATA, {
    style: (feature) => {
      const color = getFeatureColor(feature);
      return {
        fillColor: color,
        fillOpacity: 0.85,
        color: "#1e293b",
        weight: 1.5,
        opacity: 0.95
      };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      const isPred = p.is_pred;
      const rendText = isPred 
        ? `${p.rendimiento_predicho?.toFixed(2)} t/ha (Predicción Oficial)`
        : `${p.rendimiento?.toFixed(2)} t/ha (Histórico Real)`;

      let currentVal = "N/A";
      if (currentVariable === "lai" || currentVariable === "ndvi") {
        if (p.sat && p.sat[currentYear] && p.sat[currentYear][currentVariable]) {
          currentVal = p.sat[currentYear][currentVariable][currentWeekIdx]?.toFixed(2);
        }
      } else {
        if (p.clima && p.clima[currentYear] && p.clima[currentYear][currentVariable]) {
          currentVal = p.clima[currentYear][currentVariable][currentWeekIdx]?.toFixed(1);
        }
      }

      const popupContent = `
        <div class="custom-popup">
          <div class="popup-header">
            <span>Parcela ${p.id}</span>
            <span style="font-size:0.7rem; font-weight:normal; opacity:0.9;">${p.conjunto}</span>
          </div>
          <div class="popup-body">
            <div class="popup-row"><span class="popup-row-label">Ubicación:</span><span class="popup-row-val">${p.municipio}, ${p.estado}</span></div>
            <div class="popup-row"><span class="popup-row-label">Superficie:</span><span class="popup-row-val">${p.area_ha} ha</span></div>
            <div class="popup-row"><span class="popup-row-label">Rendimiento:</span><span class="popup-row-val" style="color:#15803d">${rendText}</span></div>
            <div class="popup-row"><span class="popup-row-label">Elevación / Pendiente:</span><span class="popup-row-val">${p.elevacion} m | ${p.pendiente}°</span></div>
            <hr style="border:none; border-top:1px dashed #e2e8f0; margin:0.25rem 0;">
            <div class="popup-row"><span class="popup-row-label">Variable ${currentVariable.toUpperCase()} (${currentYear} Sem ${currentWeekIdx+1}):</span><span class="popup-row-val" style="color:#1e3a8a">${currentVal}</span></div>
          </div>
        </div>
      `;

      layer.bindPopup(popupContent);
      
      layer.on({
        mouseover: (e) => {
          const l = e.target;
          l.setStyle({ weight: 3, color: "#d97706", fillOpacity: 0.95 });
          l.bringToFront();
        },
        mouseout: (e) => {
          geojsonLayer.resetStyle(e.target);
        }
      });
    }
  }).addTo(mapTerritorial);
}

// -----------------------------------------------------------------------------
// 4. TABLA INTERACTIVA DE PREDICCIONES & EXPORTACIONES (PESTAÑA 5)
// -----------------------------------------------------------------------------
let filteredPredData = [];

function initPredictionTable() {
  if (typeof PREDICTIONS_DATA === "undefined") return;
  filteredPredData = [...PREDICTIONS_DATA];

  renderPredictionTable(filteredPredData);

  // Buscador en Vivo
  const searchInput = document.getElementById("search-pred-table");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const q = e.target.value.toLowerCase().trim();
      filteredPredData = PREDICTIONS_DATA.filter(item => 
        item.id.toLowerCase().includes(q) ||
        item.estado.toLowerCase().includes(q) ||
        item.municipio.toLowerCase().includes(q)
      );
      renderPredictionTable(filteredPredData);
    });
  }

  // Botón Exportar Excel con las 4 columnas oficiales requeridas por FIRA
  const btnExcel = document.getElementById("btn-export-excel");
  if (btnExcel) {
    btnExcel.addEventListener("click", () => {
      exportPredictionsToExcel();
    });
  }

  // Botón Exportar CSV
  const btnCsv = document.getElementById("btn-export-csv");
  if (btnCsv) {
    btnCsv.addEventListener("click", () => {
      exportPredictionsToCsv();
    });
  }
}

function renderPredictionTable(data) {
  const tbody = document.getElementById("pred-table-body");
  const countElem = document.getElementById("pred-table-count");
  if (!tbody) return;

  if (countElem) {
    countElem.textContent = `${data.length} parcelas`;
  }

  tbody.innerHTML = "";

  data.forEach((row) => {
    const tr = document.createElement("tr");
    const isHigh = row.rendimiento >= 4.0;
    const badgeClass = isHigh ? "badge-yield high" : "badge-yield marginal";
    const badgeText = isHigh ? "Alto (>= 4.0)" : "Marginal (< 4.0)";

    tr.innerHTML = `
      <td style="font-weight:700; font-family:var(--font-mono);">${row.id}</td>
      <td>${row.estado}</td>
      <td>${row.municipio}</td>
      <td style="font-family:var(--font-mono); text-align:right;">${row.area_ha.toFixed(2)}</td>
      <td style="font-family:var(--font-mono); font-weight:800; text-align:right; color:#15803d;">${row.rendimiento.toFixed(2)}</td>
      <td style="text-align:center;"><span class="${badgeClass}">${badgeText}</span></td>
      <td style="font-family:var(--font-mono); text-align:right;">${row.lai_max.toFixed(2)}</td>
      <td style="font-family:var(--font-mono); text-align:right;">${row.prec_jun.toFixed(1)}</td>
      <td style="font-family:var(--font-mono); text-align:right;">${row.tmin_jun.toFixed(1)}</td>
      <td style="font-family:var(--font-mono); text-align:right;">${row.elevacion} m</td>
      <td style="font-family:var(--font-mono); text-align:right;">${row.pendiente.toFixed(1)}°</td>
    `;
    tbody.appendChild(tr);
  });
}

function exportPredictionsToExcel() {
  if (typeof XLSX === "undefined" || typeof PREDICTIONS_DATA === "undefined") {
    window.location.href = "data/predicciones_reto_agrocebada_fira_2026.xlsx";
    return;
  }

  // Estrictamente las 4 columnas requeridas por el Reto FIRA:
  const exportData = PREDICTIONS_DATA.map(item => ({
    "ID_POLIGONO": item.id,
    "AREA_HA": item.area_ha,
    "RENDIMIENTO_T_HA": parseFloat(item.rendimiento.toFixed(2)),
    "CONJUNTO": "PREDICCION"
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Predicciones_Reto_FIRA");
  XLSX.writeFile(workbook, "predicciones_reto_agrocebada_fira_2026.xlsx");
}

function exportPredictionsToCsv() {
  if (typeof PREDICTIONS_DATA === "undefined") return;

  const exportData = PREDICTIONS_DATA.map(item => ({
    "ID_POLIGONO": item.id,
    "AREA_HA": item.area_ha,
    "RENDIMIENTO_T_HA": parseFloat(item.rendimiento.toFixed(2)),
    "CONJUNTO": "PREDICCION"
  }));

  let csvContent = "data:text/csv;charset=utf-8,ID_POLIGONO,AREA_HA,RENDIMIENTO_T_HA,CONJUNTO\n";
  exportData.forEach(row => {
    csvContent += `${row.ID_POLIGONO},${row.AREA_HA},${row.RENDIMIENTO_T_HA},${row.CONJUNTO}\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "predicciones_reto_agrocebada_fira_2026.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// -----------------------------------------------------------------------------
// 5. MAPA DEDICADO DE PREDICCIONES (PESTAÑA 6: GOOGLE MAPS CALLES + DROPDOWN)
// -----------------------------------------------------------------------------
let predLayersMap = {};

function initDedicatedPredictionMap() {
  const mapElem = document.getElementById("map-prediccion");
  if (!mapElem || typeof GEOJSON_DATA === "undefined") return;

  // Mapa centrado en las parcelas de predicción con Google Maps tipo CALLES (lyrs=m)
  mapPrediction = L.map("map-prediccion", {
    center: [19.82, -98.35],
    zoom: 11,
    zoomControl: true
  });

  // Capa Google Maps Calles Oficial (lyrs=m)
  L.tileLayer("https://mt0.google.com/vt/lyrs=m&hl=es&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    attribution: "Google Maps | FIRA Banco de México"
  }).addTo(mapPrediction);

  // Filtrar solo las 59 parcelas de predicción
  const predFeatures = GEOJSON_DATA.features.filter(f => f.properties.is_pred === true);

  const predLayer = L.geoJSON({ type: "FeatureCollection", features: predFeatures }, {
    style: (feature) => {
      const y = feature.properties.rendimiento_predicho ?? 0;
      const isHigh = y >= 4.0;
      return {
        fillColor: isHigh ? "#16a34a" : "#d97706",
        fillOpacity: 0.85,
        color: isHigh ? "#14532d" : "#78350f",
        weight: 2
      };
    },
    onEachFeature: (feature, layer) => {
      const p = feature.properties;
      predLayersMap[p.id] = layer;

      const isHigh = p.rendimiento_predicho >= 4.0;
      const badgeColor = isHigh ? "#15803d" : "#b45309";
      const statusText = isHigh ? "Alto (>= 4.0 t/ha)" : "Marginal (< 4.0 t/ha)";

      const popupContent = `
        <div class="custom-popup">
          <div class="popup-header" style="background:${isHigh ? '#14532d' : '#78350f'}">
            <span>Parcela ${p.id}</span>
            <span style="font-size:0.7rem;">Predicción 2026</span>
          </div>
          <div class="popup-body">
            <div class="popup-row"><span class="popup-row-label">Ubicación:</span><span class="popup-row-val">${p.municipio}, ${p.estado}</span></div>
            <div class="popup-row"><span class="popup-row-label">Superficie:</span><span class="popup-row-val">${p.area_ha} ha</span></div>
            <div class="popup-row"><span class="popup-row-label">Rendimiento Predicho:</span><span class="popup-row-val" style="color:${badgeColor}; font-size:1rem;">${p.rendimiento_predicho.toFixed(2)} t/ha</span></div>
            <div class="popup-row"><span class="popup-row-label">Clasificación:</span><span class="popup-row-val" style="color:${badgeColor};">${statusText}</span></div>
            <hr style="border:none; border-top:1px dashed #e2e8f0; margin:0.25rem 0;">
            <div class="popup-row"><span class="popup-row-label">LAI Máximo 2025:</span><span class="popup-row-val">${p.lai_max_2025}</span></div>
            <div class="popup-row"><span class="popup-row-label">Lluvia Junio 2025:</span><span class="popup-row-val">${p.prec_jun_2025} mm</span></div>
            <div class="popup-row"><span class="popup-row-label">Elevación / Pendiente:</span><span class="popup-row-val">${p.elevacion} m | ${p.pendiente}°</span></div>
          </div>
        </div>
      `;

      layer.bindPopup(popupContent);

      // Al hacer clic en el polígono, sincronizar el select desplegable y la ficha
      layer.on("click", () => {
        selectParcelInDropdown(p.id);
      });
    }
  }).addTo(mapPrediction);

  if (predFeatures.length > 0) {
    mapPrediction.fitBounds(predLayer.getBounds(), { padding: [25, 25] });
  }

  // Inicializar Menú Desplegable de Parcelas
  initParcelDropdown(PREDICTIONS_DATA);
}

function initParcelDropdown(data) {
  const selectElem = document.getElementById("select-parcel-pred");
  if (!selectElem) return;

  // Ordenar parcelas por ID numérico
  const sorted = [...data].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));

  selectElem.innerHTML = `<option value="">-- Elige una parcela para centrar en el mapa (${sorted.length} disponibles) --</option>`;

  sorted.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.id;
    opt.textContent = `${item.id} | ${item.municipio}, ${item.estado} (${item.area_ha} ha) - ${item.rendimiento.toFixed(2)} t/ha`;
    selectElem.appendChild(opt);
  });

  selectElem.addEventListener("change", (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      document.getElementById("selected-parcel-pill").style.display = "none";
      return;
    }
    focusParcelOnMap(selectedId);
  });
}

function selectParcelInDropdown(parcelId) {
  const selectElem = document.getElementById("select-parcel-pred");
  if (selectElem) {
    selectElem.value = parcelId;
  }
  updateParcelPill(parcelId);
}

function focusParcelOnMap(parcelId) {
  const targetLayer = predLayersMap[parcelId];
  if (targetLayer && mapPrediction) {
    // Vuelo suave centrado exactamente en el polígono sin que el usuario tenga que bajar
    mapPrediction.flyToBounds(targetLayer.getBounds(), {
      padding: [70, 70],
      maxZoom: 16,
      duration: 1.0
    });

    setTimeout(() => {
      targetLayer.openPopup();
    }, 1000);

    updateParcelPill(parcelId);
  }
}

function updateParcelPill(parcelId) {
  const item = PREDICTIONS_DATA.find(p => p.id === parcelId);
  const pill = document.getElementById("selected-parcel-pill");
  if (!item || !pill) return;

  document.getElementById("pill-id").textContent = item.id;
  const yieldElem = document.getElementById("pill-yield");
  yieldElem.textContent = `${item.rendimiento.toFixed(2)} t/ha`;
  yieldElem.style.color = item.rendimiento >= 4.0 ? "var(--high-yield)" : "var(--marginal-yield)";
  document.getElementById("pill-area").textContent = `${item.area_ha} ha`;
  document.getElementById("pill-loc").textContent = `${item.municipio}, ${item.estado}`;

  pill.style.display = "flex";
}
