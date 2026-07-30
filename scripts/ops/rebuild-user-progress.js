#!/usr/bin/env node

// Reconstruye user_progress a partir de word_progress.
//
// CONTEXTO — leer antes de correr con --write.
//
// Los contadores de user_progress quedaron corruptos por un desajuste de
// contrato: firebaseClient.updateProgress() es una API de evento (increment de
// 1), pero firebase-progress-sync.syncUserProgress() le pasaba snapshots
// agregados que no tienen currentLevel, isCorrect ni timeSpent. El resultado era
// updateProgress(1, true, 0) en cada llamada, incluido el sync periódico cada
// cinco minutos. Corregido en e71db47; esto es el arrastre histórico.
//
// LO QUE NO SE PUEDE RECUPERAR. word_progress usa docId {uid}_{wordId} con
// setDoc(merge:true): hay UN documento por palabra, sobrescrito en cada repaso.
// Solo sobrevive el último intento. Por lo tanto NO son derivables:
//   - el número real de repasos (una palabra vista 20 veces figura una sola vez)
//   - aciertos/errores por evento (solo queda el último resultado de cada palabra)
//   - las rachas (requieren la secuencia cronológica de eventos)
//   - el tiempo acumulado real (solo el último response_time de cada palabra)
//
// SEMÁNTICA ELEGIDA. Los contadores se redefinen a algo defendible:
//   total_words_studied = palabras DISTINTAS vistas en ese nivel
//   correct_answers     = de esas, cuántas quedaron con último intento correcto
//   incorrect_answers   = el resto
//   total_time_spent    = suma de los últimos response_time, en minutos
//   current_streak / best_streak = 0 (no derivables)
//   last_studied        = max(updated_at)
//
// OJO CON LA FORMA DE LOS CAMPOS. Hay dos escritores de word_progress:
//   - user-progress-backend.js escribe snake_case y pasa firestore.rules
//   - firebase-progress-sync.js escribe camelCase (isCorrect, hskLevel,
//     responseTime) y la regla isValidWordProgress() lo RECHAZA, porque
//     hasOnlyAllowedFields() solo admite la lista snake_case
// El script lee ambas formas y reporta cuántos documentos vio de cada una.
//
// DOS MODOS.
//   (por defecto) reconstruye desde word_progress con la semántica redefinida
//                 que se describe arriba.
//   --reset       pone todos los contadores en cero y arranca limpio desde el
//                 arreglo de sync. Es la opción honesta cuando el historial
//                 recuperable no justifica arrastrar números que igual no
//                 reflejan lo que el usuario hizo. Conserva user_id, hsk_level y
//                 los campos denormalizados que el leaderboard lee desde acá.
//
// Uso:
//   GOOGLE_APPLICATION_CREDENTIALS=/ruta/service-account.json \
//     node scripts/ops/rebuild-user-progress.js                 # auditoría, no escribe
//   ... --reset                                                 # muestra qué pondría en cero
//   ... --user <uid>                                            # acota a un usuario
//   ... --write                                                 # aplica (hace backup antes)

const { writeFileSync, mkdirSync } = require("fs");
const { join } = require("path");
const admin = require("firebase-admin");

const BACKUP_DIR = join(process.cwd(), "backups");

function parseArgs(argv) {
  const args = { write: false, user: null, mode: "rebuild" };
  for (let i = 2; i < argv.length; i++) {
    if (argv[i] === "--write") args.write = true;
    else if (argv[i] === "--reset") args.mode = "reset";
    else if (argv[i] === "--user" && argv[i + 1]) args.user = argv[++i];
    else {
      console.error(`Argumento desconocido: ${argv[i]}`);
      process.exit(1);
    }
  }
  return args;
}

function initFirestore() {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error(
      "Falta GOOGLE_APPLICATION_CREDENTIALS con la ruta al service account JSON.",
    );
    console.error(
      "Se saca de la consola de Firebase → Configuración del proyecto → Cuentas de servicio.",
    );
    process.exit(1);
  }
  admin.initializeApp({ credential: admin.applicationDefault() });
  return admin.firestore();
}

// Los dos escritores usan nombres distintos; se aceptan ambos.
function readWordDoc(data) {
  const level = data.hsk_level ?? data.hskLevel ?? null;
  const isCorrect = data.is_correct ?? data.isCorrect ?? null;
  const responseTime = data.response_time ?? data.responseTime ?? 0;
  const shape = data.hsk_level !== undefined ? "snake_case" : "camelCase";
  return { level, isCorrect, responseTime, shape };
}

function toTimestampMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === "function") return value.toMillis();
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

async function collectWordProgress(db, userFilter) {
  let query = db.collection("word_progress");
  if (userFilter) query = query.where("user_id", "==", userFilter);

  const snapshot = await query.get();
  const byUserLevel = new Map();
  const shapes = { snake_case: 0, camelCase: 0, sinNivel: 0 };

  snapshot.forEach((doc) => {
    const data = doc.data();
    const userId = data.user_id;
    if (!userId) return;

    const { level, isCorrect, responseTime, shape } = readWordDoc(data);
    if (level === null || level === undefined) {
      shapes.sinNivel++;
      return;
    }
    shapes[shape]++;

    const key = `${userId}_hsk${level}`;
    const bucket = byUserLevel.get(key) || {
      userId,
      level: Number(level),
      distinctWords: 0,
      correct: 0,
      incorrect: 0,
      responseTimeMs: 0,
      lastStudied: 0,
    };

    bucket.distinctWords++;
    if (isCorrect === true) bucket.correct++;
    else bucket.incorrect++;
    bucket.responseTimeMs += Number(responseTime) || 0;
    bucket.lastStudied = Math.max(
      bucket.lastStudied,
      toTimestampMillis(data.updated_at),
    );

    byUserLevel.set(key, bucket);
  });

  return { byUserLevel, shapes, total: snapshot.size };
}

async function collectUserProgress(db, userFilter) {
  let query = db.collection("user_progress");
  if (userFilter) query = query.where("user_id", "==", userFilter);

  const snapshot = await query.get();
  const current = new Map();
  snapshot.forEach((doc) => current.set(doc.id, { id: doc.id, ...doc.data() }));
  return current;
}

function buildTarget(bucket) {
  return {
    user_id: bucket.userId,
    hsk_level: bucket.level,
    total_words_studied: bucket.distinctWords,
    correct_answers: bucket.correct,
    incorrect_answers: bucket.incorrect,
    // response_time se guarda en ms; total_time_spent se lee en minutos
    // (leaderboard.js lo divide por 60 para mostrar horas).
    total_time_spent: +(bucket.responseTimeMs / 60000).toFixed(2),
    current_streak: 0,
    best_streak: 0,
  };
}

// Modo --reset: pone los contadores en cero y deja el resto del documento.
// Se conservan user_id y hsk_level (identidad del doc) y los campos
// denormalizados username / display_name / avatar_url, que el leaderboard lee
// desde acá: borrarlos dejaría las tarjetas sin nombre ni avatar.
//
// last_studied se elimina porque con los contadores en cero es una fecha que no
// corresponde a ninguna actividad registrada.
function buildReset(existing) {
  return {
    user_id: existing.user_id,
    hsk_level: existing.hsk_level,
    total_words_studied: 0,
    correct_answers: 0,
    incorrect_answers: 0,
    current_streak: 0,
    best_streak: 0,
    total_time_spent: 0,
    last_studied: admin.firestore.FieldValue.delete(),
  };
}

function reportResetDiff(current) {
  return [...current.values()]
    .map((doc) => ({
      docId: doc.id,
      antes: `${doc.total_words_studied ?? 0} est / ${doc.correct_answers ?? 0} ok / ${doc.incorrect_answers ?? 0} err / racha ${doc.best_streak ?? 0} / ${doc.total_time_spent ?? 0} min`,
      despues: "todo en 0",
    }))
    .sort((a, b) => a.docId.localeCompare(b.docId));
}

function reportDiff(targets, current) {
  const rows = [];
  for (const [docId, target] of targets) {
    const before = current.get(docId);
    rows.push({
      docId,
      antes: before
        ? `${before.total_words_studied ?? 0} est / ${before.correct_answers ?? 0} ok / racha ${before.best_streak ?? 0}`
        : "(no existe)",
      despues: `${target.total_words_studied} est / ${target.correct_answers} ok / racha 0`,
    });
  }
  rows.sort((a, b) => a.docId.localeCompare(b.docId));
  return rows;
}

// Backup completo antes de cualquier escritura. Es la única vuelta atrás.
function backup(current) {
  mkdirSync(BACKUP_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const path = join(BACKUP_DIR, `user_progress-${stamp}.json`);
  writeFileSync(path, JSON.stringify([...current.values()], null, 2));
  console.log(`Backup de ${current.size} documentos en ${path}`);
  return path;
}

async function runReset(db, args) {
  const current = await collectUserProgress(db, args.user);
  console.log(`user_progress: ${current.size} documentos`);
  console.log("");

  if (current.size === 0) {
    console.log("No hay nada que resetear.");
    return;
  }

  console.log("Se pondrían en cero:");
  console.log("");
  for (const row of reportResetDiff(current)) {
    console.log(`  ${row.docId}`);
    console.log(`      antes:   ${row.antes}`);
    console.log(`      después: ${row.despues}`);
  }
  console.log("");
  console.log(
    "Se conservan user_id, hsk_level y los campos denormalizados que usa el leaderboard.",
  );
  console.log("");

  if (!args.write) {
    console.log("Dry-run. Nada escrito. Agregar --write para aplicar.");
    return;
  }

  const backupPath = backup(current);

  let written = 0;
  for (const doc of current.values()) {
    await db
      .collection("user_progress")
      .doc(doc.id)
      .set(buildReset(doc), { merge: true });
    written++;
  }

  console.log(`Listo: ${written} documentos reseteados.`);
  console.log(`Para revertir, restaurar desde ${backupPath}.`);
}

async function main() {
  const args = parseArgs(process.argv);
  const db = initFirestore();

  console.log(`Modo: ${args.mode}`);
  console.log(args.user ? `Usuario: ${args.user}` : "Todos los usuarios");
  console.log("");

  if (args.mode === "reset") {
    await runReset(db, args);
    return;
  }

  const { byUserLevel, shapes, total } = await collectWordProgress(db, args.user);
  console.log(`word_progress: ${total} documentos`);
  console.log(`  snake_case (escritos por user-progress-backend): ${shapes.snake_case}`);
  console.log(`  camelCase  (los rechaza firestore.rules):        ${shapes.camelCase}`);
  console.log(`  sin nivel  (no se pueden atribuir):              ${shapes.sinNivel}`);
  console.log("");

  if (byUserLevel.size === 0) {
    console.log(
      "No hay nada que reconstruir: word_progress no tiene documentos utilizables.",
    );
    console.log(
      "Si esto es inesperado, revisar isValidWordProgress() en firestore.rules:",
    );
    console.log(
      "hasOnlyAllowedFields() solo admite snake_case, así que las escrituras",
    );
    console.log("camelCase se rechazan y el error se traga en saveWordProgress().");
    return;
  }

  const current = await collectUserProgress(db, args.user);
  const targets = new Map();
  for (const [docId, bucket] of byUserLevel) targets.set(docId, buildTarget(bucket));

  console.log(`user_progress: ${current.size} documentos actuales`);
  console.log(`Se reconstruirían ${targets.size} documentos:`);
  console.log("");
  for (const row of reportDiff(targets, current)) {
    console.log(`  ${row.docId}`);
    console.log(`      antes:   ${row.antes}`);
    console.log(`      después: ${row.despues}`);
  }
  console.log("");

  // Documentos que existen hoy y que la reconstrucción NO cubre: son los que
  // se inflaron sin respaldo en word_progress. Se listan pero no se tocan.
  const huerfanos = [...current.keys()].filter((id) => !targets.has(id));
  if (huerfanos.length > 0) {
    console.log(
      `${huerfanos.length} documentos de user_progress sin respaldo en word_progress (NO se tocan):`,
    );
    for (const id of huerfanos) console.log(`  ${id}`);
    console.log("");
  }

  if (!args.write) {
    console.log("Dry-run. Nada escrito. Agregar --write para aplicar.");
    return;
  }

  const backupPath = backup(current);

  let written = 0;
  for (const [docId, target] of targets) {
    // merge:true para no borrar los campos denormalizados (username,
    // display_name, avatar_url) que el leaderboard necesita.
    await db.collection("user_progress").doc(docId).set(
      {
        ...target,
        last_studied: byUserLevel.get(docId).lastStudied
          ? admin.firestore.Timestamp.fromMillis(byUserLevel.get(docId).lastStudied)
          : admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    written++;
  }

  console.log(`Listo: ${written} documentos reconstruidos.`);
  console.log(`Para revertir, restaurar desde ${backupPath}.`);
}

main().catch((error) => {
  console.error("Falló la reconstrucción:", error.message);
  process.exit(1);
});
