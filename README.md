# Dashboard Web Interactivo - Reto AgroCebada FIRA 2026

Plataforma analítica geoespacial y predictiva desarrollada para el **Reto Nacional de Ciencia de Datos AgroCebada 2026** de **FIRA (Fideicomisos Instituidos en Relación con la Agricultura - Banco de México)**.

La aplicación está construida con arquitectura **100% estática (HTML5, Vanilla CSS, Vanilla JavaScript, Leaflet con Google Maps Calles y Chart.js)**, lo que permite que sea desplegada inmediatamente en **GitHub Pages** sin necesidad de servidores Python en producción.

---

## Estructura de las 6 Pestañas del Dashboard

### 1. Pregunta 1: Índice Satelital (`lai_promedio_max`)
- **Respuesta Oficial y Específica**: Muestra el dictamen técnico que designa a `lai_promedio_max` como la métrica ganadora.
- **Evidencia Visual**: Gráfico interactivo de dispersión (LAI vs NDVI) que demuestra la saturación óptica del NDVI a ~0.80 frente a la linealidad del LAI (hasta más de 2.5 m²/m²).
- **4 Argumentos Agronómicos**:
  1. *Fábrica de granos*: Mide m² de hoja por m² de suelo (LAI > 2.2 rinde > 4.2 t/ha).
  2. *Supera la saturación del NDVI*: Diferencia lotes de 3.5 t/ha de lotes de 5.0 t/ha.
  3. *Pico máximo vs promedio anual*: Captura la floración sin diluirse con rastrojo o suelo arado.
  4. *Promedio del predio vs punto aislado*: Mide la salud homogénea del cultivo, no una maleza o árbol en la orilla.

### 2. Pregunta 2: Clima Decisivo (`tmin_jun`, `prec_jun`, `tmax_jul`)
- **Variables Decisivas Oficiales**:
  1. `tmin_jun_c`: Noches templadas en junio (9–10 °C) impulsan el amacollamiento (> 4.3 t/ha); noches frías (6–7 °C) entumen la plántula (< 3.2 t/ha).
  2. `prec_jun_mm`: Exceso de lluvia (> 120 mm) en terrenos planos (< 2°) provoca asfixia radicular; laderas con drenaje (>= 2°) rinden > 4.5 t/ha.
  3. `tmax_jul_c`: Calor diurno en floración; umbral crítico a 22.8 °C (más de 23.0 °C causa aborto floral y grano vano).
- **2 Gráficos Interactivos**:
  - Curva LOWESS de estrés térmico en julio con óptimo a 22.8 °C.
  - Lluvia de junio vs rendimiento segregado por pendiente de terreno.

### 3. Pregunta 3: Combinación Óptima (Motor Biofísico de 4 Pilares)
- **Los 4 Pilares Biofísicos**:
  1. *Pilar 1 (Nacencia)*: Clima de junio (`tmin_jun` + `prec_jun`).
  2. *Pilar 2 (Vigor)*: Satélite de floración (`lai_promedio_max`).
  3. *Pilar 3 (Manejo)*: Escala del predio (`log(AREA_HA)`).
  4. *Pilar 4 (Entorno)*: Microclima y suelo (`elevacion` + `Estado`).
- **Control de Multicolinealidad (VIF)**: Explicación de por qué se evitan variables espejo (NDVI, EVI, MSAVI juntos disparan VIF > 12) manteniendo un VIF en verde (< 3.0).
- **Evidencia Visual**: Gráfico de superficie en escala logarítmica vs rendimiento.

### 4. Visor Territorial (197 Parcelas)
- **Cartografía Oficial Google Maps Calles (`lyrs=m`)**: Mapa callejero limpio con nombres de poblados y carreteras donde destacan los polígonos.
- **Selector Multianual (2022–2025)**: Consulta de 4 años agrícolas completos.
- **Línea de Tiempo Dinámica (27 Semanas)**: Slider continuo con reproducción automática (Play/Pausa) que recorre la fenología completa de la cebada.
- **Selector de Capas**: LAI Foliar, NDVI Satelital, Precipitación Acumulada Semanal y Temperatura Mínima Nocturna con leyenda adaptativa.

### 5. Modelos de ML y Datos
- **Benchmarking de Modelos**: Comparativa entre XGBoost Regressor (Modelo Oficial Seleccionado), Random Forest y Ridge Regularizado con métricas OOF y validación cruzada en 10 pliegues (10-Fold CV).
- **Matrices de Confusión Interactivas**: TP: 74, TN: 51, FP: 8, FN: 5 (Exactitud 90.6%).
- **DataFrame Oficial de Predicciones (59 Parcelas)**: Tabla interactiva con buscador en vivo por ID, Estado o Municipio.
- **Descargas Directas**:
  - Botón **Excel (.xlsx)** con **estrictamente las 4 columnas del Reto**: `ID_POLIGONO`, `AREA_HA`, `RENDIMIENTO_T_HA`, `CONJUNTO`.
  - Botón **CSV**.

### 6. Mapa de Predicción (59 Parcelas Objetivo)
- **Cartografía Google Maps Calles**: Visor compacto de 440px de altura diseñado para visualizarse cómodamente sin scroll excesivo.
- **Menú Desplegable Superior (`<select>`)**: Permite elegir cualquiera de las 59 parcelas por su ID; al seleccionarla, el mapa vuela suavemente (*fly-to*) hacia el predio, lo centra automáticamente en pantalla y abre su ficha técnica emergente.
- **Ficha Informativa Instantánea**: Muestra el rendimiento predicho, hectáreas y municipio de la parcela seleccionada.
- **Semáforo Productivo**: Verde para parcelas de alto rendimiento (>= 4.0 t/ha, 61.0%) y Ámbar para parcelas marginales (< 4.0 t/ha, 39.0%).

---

## Cómo Publicar en GitHub Pages

1. Sube todos los archivos de la carpeta [`dashboard_web/`](file:///c:/Users/Jaime/Documents/proyectos/fira_cebada/dashboard_web/) a un repositorio en tu cuenta de GitHub (ej. `reto-cebada-fira-dashboard`).
2. En GitHub, entra a **Settings** > **Pages**.
3. En **Build and deployment**, selecciona:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` y carpeta `/ (root)`
4. Haz clic en **Save**. En un par de minutos tu página estará activa en línea:  
   `https://<tu-usuario>.github.io/<nombre-del-repo>/`

---

## Cómo Ejecutar Localmente

- **Opción 1:** Doble clic en `index.html` para abrirlo en cualquier navegador web.
- **Opción 2:** Ejecutar un servidor local con Python:
  ```bash
  python -m http.server 8000
  ```
  y abrir `http://localhost:8000`.
