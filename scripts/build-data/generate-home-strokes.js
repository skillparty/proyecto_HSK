#!/usr/bin/env node

// Genera el bloque charsData de home-cultural-portal-scene.js a partir de los
// datos canónicos de trazos (assets/data/etymology/strokes/*.json, de Make Me a
// Hanzi vía hanzi-writer — los mismos que usa la pestaña de Etimología).
//
// Antes las coordenadas estaban escritas a mano. El orden de trazos resultaba
// correcto, pero las formas no: en 玻 el componente 皮 estaba deformado, en 亚
// los dos trazos centrales se dibujaban horizontales cuando son diagonales, y
// en 维 el punto de 隹 caía hacia el lado equivocado.
//
// Derivarlas del dato canónico hace que orden Y forma sean correctos por
// construcción, y que agregar o cambiar un carácter sea regenerar, no redibujar.
//
// Uso: node scripts/build-data/generate-home-strokes.js

const { readFileSync } = require("fs");
const { join } = require("path");

const ROOT = process.cwd();
const STROKES_DIR = join(ROOT, "assets", "data", "etymology", "strokes");

// 中国 (China) + 玻利维亚 (Bolivia), el par que dibuja la animación del home.
const CHARACTERS = ["中", "国", "玻", "利", "维", "亚"];

// Make Me a Hanzi trabaja en una caja de 1024x1024 con el origen abajo a la
// izquierda y la y creciendo hacia arriba, igual que Three.js. El centro
// tipográfico real está algo por debajo del centro geométrico.
const CENTER_X = 512;
const CENTER_Y = 400;
const SCALE = 480;

// Las medians traen muchos puntos por trazo. Para una animación de líneas no
// hace falta esa densidad: se descartan los puntos que no aportan curvatura.
const SIMPLIFY_TOLERANCE = 0.035;

function toScene(point) {
  return [
    +((point[0] - CENTER_X) / SCALE).toFixed(3),
    +((point[1] - CENTER_Y) / SCALE).toFixed(3),
  ];
}

// Distancia perpendicular de un punto al segmento a-b.
function perpendicularDistance(point, a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - a[0], point[1] - a[1]);
  const t =
    ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy);
  const clamped = Math.max(0, Math.min(1, t));
  return Math.hypot(
    point[0] - (a[0] + clamped * dx),
    point[1] - (a[1] + clamped * dy),
  );
}

// Ramer-Douglas-Peucker: conserva los vértices donde el trazo realmente dobla.
function simplify(points, tolerance) {
  if (points.length <= 2) return points;

  let maxDistance = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1],
    );
    if (distance > maxDistance) {
      maxDistance = distance;
      index = i;
    }
  }

  if (maxDistance <= tolerance) return [points[0], points[points.length - 1]];

  return [
    ...simplify(points.slice(0, index + 1), tolerance).slice(0, -1),
    ...simplify(points.slice(index), tolerance),
  ];
}

function buildCharacter(character) {
  const raw = readFileSync(join(STROKES_DIR, `${character}.json`), "utf8");
  const { medians } = JSON.parse(raw);
  if (!Array.isArray(medians) || medians.length === 0) {
    console.error(`Sin medians para ${character}`);
    process.exit(1);
  }

  const strokes = medians.map((median) =>
    simplify(median.map(toScene), SIMPLIFY_TOLERANCE),
  );
  return { character, strokes };
}

function render(characters) {
  const lines = ["        const charsData = ["];

  characters.forEach((entry, index) => {
    lines.push("            {");
    lines.push(`                name: '${entry.character}',`);
    lines.push(`                strokes: [`);
    entry.strokes.forEach((stroke, strokeIndex) => {
      const points = stroke.map(([x, y]) => `V(${x}, ${y})`).join(", ");
      const comma = strokeIndex === entry.strokes.length - 1 ? "" : ",";
      lines.push(`                    [${points}]${comma}`);
    });
    lines.push("                ]");
    lines.push(index === characters.length - 1 ? "            }" : "            },");
  });

  lines.push("        ];");
  return lines.join("\n");
}

function main() {
  const characters = CHARACTERS.map(buildCharacter);

  for (const entry of characters) {
    const points = entry.strokes.reduce((sum, s) => sum + s.length, 0);
    console.error(
      `  ${entry.character}: ${entry.strokes.length} trazos, ${points} puntos`,
    );
  }

  process.stdout.write(render(characters) + "\n");
}

main();
