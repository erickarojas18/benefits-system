#!/usr/bin/env node

/**
 * CLI interactiva para el Sistema de Membresías y Beneficios
 * Navega con las flechas del teclado y confirma con Enter.
 */

const inquirer = require("inquirer");
const MembershipService = require("./src/MembershipService");
const PointsService = require("./src/PointsService");
const ReportService = require("./src/ReportService");
const { MembershipRepository, MovementRepository } = require("./src/repositories");

// ─── Inicialización de servicios ───────────────────────────────────────────
const membershipRepo = new MembershipRepository();
const movementRepo = new MovementRepository();

const membershipService = new MembershipService(membershipRepo);
const pointsService = new PointsService(membershipRepo, movementRepo);
const reportService = new ReportService(membershipRepo, movementRepo);

// ─── Utilidades de UI ──────────────────────────────────────────────────────
const divider = () => console.log("\n" + "─".repeat(50));
const success = (msg) => console.log(`\n✅  ${msg}`);
const error = (msg) => console.log(`\n❌  ${msg}`);
const info = (label, value) => console.log(`   ${label}: ${value}`);

const pause = () =>
  inquirer.prompt([{ type: "input", name: "_", message: "Presiona Enter para continuar..." }]);

// ─── Menús ─────────────────────────────────────────────────────────────────

async function menuPrincipal() {
  divider();
  console.log("🏆  SISTEMA DE MEMBRESÍAS Y BENEFICIOS");
  divider();

  const { opcion } = await inquirer.prompt([
    {
      type: "list",
      name: "opcion",
      message: "¿Qué deseas hacer?",
      choices: [
        { name: "👤  Gestión de Membresías", value: "membresias" },
        { name: "⭐  Gestión de Puntos",     value: "puntos" },
        { name: "📊  Reportes",              value: "reportes" },
        { name: "⚙️   Configurar Reglas",    value: "reglas" },
        new inquirer.Separator(),
        { name: "🚪  Salir",                 value: "salir" },
      ],
    },
  ]);

  switch (opcion) {
    case "membresias": return menuMembresias();
    case "puntos":     return menuPuntos();
    case "reportes":   return menuReportes();
    case "reglas":     return menuReglas();
    case "salir":
      console.log("\n👋  ¡Hasta luego!\n");
      process.exit(0);
  }
}

// ─── Membresías ────────────────────────────────────────────────────────────

async function menuMembresias() {
  divider();
  const { opcion } = await inquirer.prompt([
    {
      type: "list",
      name: "opcion",
      message: "👤  Membresías — ¿Qué deseas hacer?",
      choices: [
        { name: "➕  Registrar nueva membresía",  value: "registrar" },
        { name: "✔️   Activar membresía",          value: "activar" },
        { name: "✖️   Desactivar membresía",       value: "desactivar" },
        { name: "🔍  Consultar estado",            value: "consultar" },
        new inquirer.Separator(),
        { name: "⬅️   Volver al menú principal",  value: "volver" },
      ],
    },
  ]);

  switch (opcion) {
    case "registrar":  await registrarMembresia(); break;
    case "activar":    await activarMembresia(); break;
    case "desactivar": await desactivarMembresia(); break;
    case "consultar":  await consultarMembresia(); break;
    case "volver":     return menuPrincipal();
  }

  return menuMembresias();
}

async function registrarMembresia() {
  divider();
  console.log("➕  Registrar nueva membresía\n");

  const datos = await inquirer.prompt([
    { type: "input", name: "id",    message: "ID de membresía:",   validate: (v) => v.trim() !== "" || "El ID no puede estar vacío" },
    { type: "input", name: "name",  message: "Nombre completo:",   validate: (v) => v.trim() !== "" || "El nombre no puede estar vacío" },
    { type: "input", name: "email", message: "Correo electrónico:", validate: (v) => v.includes("@") || "Ingresa un correo válido" },
    {
      type: "list",
      name: "plan",
      message: "Plan de membresía:",
      choices: ["BASIC", "SILVER", "GOLD", "PLATINUM"],
    },
  ]);

  try {
    const result = membershipService.registerMembership(datos);
    success(`Membresía registrada exitosamente`);
    info("ID",     result.id);
    info("Nombre", result.name);
    info("Plan",   result.plan);
    info("Estado", "Activa ✔️");
  } catch (e) {
    error(e.message);
  }

  await pause();
}

async function activarMembresia() {
  divider();
  const { id } = await inquirer.prompt([
    { type: "input", name: "id", message: "ID de la membresía a activar:", validate: (v) => v.trim() !== "" || "Ingresa un ID" },
  ]);

  try {
    membershipService.activateMembership(id.trim());
    success(`Membresía "${id}" activada correctamente`);
  } catch (e) {
    error(e.message);
  }

  await pause();
}

async function desactivarMembresia() {
  divider();
  const { id } = await inquirer.prompt([
    { type: "input", name: "id", message: "ID de la membresía a desactivar:", validate: (v) => v.trim() !== "" || "Ingresa un ID" },
  ]);

  try {
    membershipService.deactivateMembership(id.trim());
    success(`Membresía "${id}" desactivada correctamente`);
  } catch (e) {
    error(e.message);
  }

  await pause();
}

async function consultarMembresia() {
  divider();
  const { id } = await inquirer.prompt([
    { type: "input", name: "id", message: "ID de la membresía:", validate: (v) => v.trim() !== "" || "Ingresa un ID" },
  ]);

  try {
    const status = membershipService.getMembershipStatus(id.trim());
    success("Estado de membresía");
    info("ID",     status.id);
    info("Nombre", status.name);
    info("Plan",   status.plan);
    info("Estado", status.active ? "Activa ✔️" : "Inactiva ✖️");
    info("Puntos", status.points);
  } catch (e) {
    error(e.message);
  }

  await pause();
}

// ─── Puntos ────────────────────────────────────────────────────────────────

async function menuPuntos() {
  divider();
  const { opcion } = await inquirer.prompt([
    {
      type: "list",
      name: "opcion",
      message: "⭐  Puntos — ¿Qué deseas hacer?",
      choices: [
        { name: "➕  Acumular puntos",          value: "acumular" },
        { name: "🎁  Redimir puntos",            value: "redimir" },
        { name: "📋  Ver historial de movimientos", value: "historial" },
        new inquirer.Separator(),
        { name: "⬅️   Volver al menú principal", value: "volver" },
      ],
    },
  ]);

  switch (opcion) {
    case "acumular":  await acumularPuntos(); break;
    case "redimir":   await redimirPuntos(); break;
    case "historial": await verHistorial(); break;
    case "volver":    return menuPrincipal();
  }

  return menuPuntos();
}

async function acumularPuntos() {
  divider();
  const { id } = await inquirer.prompt([
    { type: "input", name: "id", message: "ID de la membresía:", validate: (v) => v.trim() !== "" || "Ingresa un ID" },
  ]);

  try {
    const result = pointsService.accumulatePoints(id.trim());
    success("Puntos acumulados");
    info("Puntos ganados", `+${result.pointsEarned}`);
    info("Total acumulado", result.totalPoints);
  } catch (e) {
    error(e.message);
  }

  await pause();
}

async function redimirPuntos() {
  divider();
  const { id, puntos } = await inquirer.prompt([
    { type: "input", name: "id",     message: "ID de la membresía:", validate: (v) => v.trim() !== "" || "Ingresa un ID" },
    { type: "number", name: "puntos", message: "Puntos a redimir:",   validate: (v) => v > 0 || "Debe ser mayor a 0" },
  ]);

  try {
    const result = pointsService.redeemPoints(id.trim(), puntos);
    success("Puntos redimidos exitosamente");
    info("Puntos redimidos",  result.pointsRedeemed);
    info("Beneficio obtenido", `$${result.benefitValue.toFixed(2)}`);
    info("Puntos restantes",  result.remainingPoints);
  } catch (e) {
    error(e.message);
  }

  await pause();
}

async function verHistorial() {
  divider();
  const { id } = await inquirer.prompt([
    { type: "input", name: "id", message: "ID de la membresía:", validate: (v) => v.trim() !== "" || "Ingresa un ID" },
  ]);

  try {
    const historial = pointsService.getMovementHistory(id.trim());

    if (historial.length === 0) {
      console.log("\n   Sin movimientos registrados.");
    } else {
      console.log(`\n📋  Historial de movimientos (${historial.length} registros):\n`);
      historial.forEach((mov, i) => {
        const tipo  = mov.type === "ACCUMULATION" ? "⬆️  ACUMULACIÓN" : "⬇️  REDENCIÓN";
        const pts   = mov.type === "ACCUMULATION" ? `+${mov.points}` : `${mov.points}`;
        const fecha = new Date(mov.date).toLocaleString("es-CR");
        console.log(`   ${i + 1}. ${tipo} | ${pts} pts | ${fecha}`);
      });
    }
  } catch (e) {
    error(e.message);
  }

  await pause();
}

// ─── Reportes ──────────────────────────────────────────────────────────────

async function menuReportes() {
  divider();
  const { opcion } = await inquirer.prompt([
    {
      type: "list",
      name: "opcion",
      message: "📊  Reportes — ¿Qué deseas ver?",
      choices: [
        { name: "👥  Reporte de membresías activas/inactivas", value: "membresias" },
        { name: "⭐  Reporte de puntos acumulados/redimidos",  value: "puntos" },
        new inquirer.Separator(),
        { name: "⬅️   Volver al menú principal",              value: "volver" },
      ],
    },
  ]);

  switch (opcion) {
    case "membresias": await reporteMembresias(); break;
    case "puntos":     await reportePuntos(); break;
    case "volver":     return menuPrincipal();
  }

  return menuReportes();
}

async function reporteMembresias() {
  divider();
  console.log("👥  Reporte de Membresías\n");

  const report = reportService.getMembershipReport();

  info("Total activas",   report.totalActive);
  info("Total inactivas", report.totalInactive);

  if (report.active.length > 0) {
    console.log("\n   ✔️  Activas:");
    report.active.forEach((m) => console.log(`      • ${m.id} — ${m.name} (${m.plan})`));
  }
  if (report.inactive.length > 0) {
    console.log("\n   ✖️  Inactivas:");
    report.inactive.forEach((m) => console.log(`      • ${m.id} — ${m.name} (${m.plan})`));
  }
  if (report.totalActive === 0 && report.totalInactive === 0) {
    console.log("   Sin membresías registradas.");
  }

  await pause();
}

async function reportePuntos() {
  divider();
  console.log("⭐  Reporte de Puntos\n");

  const report = reportService.getPointsReport();

  info("Total acumulado",      `${report.totalAccumulated} pts`);
  info("Total redimido",       `${report.totalRedeemed} pts`);
  info("Movimientos totales",  report.movementCount);
  info("Acumulaciones",        report.accumulationCount ?? 0);
  info("Redenciones",          report.redemptionCount ?? 0);

  await pause();
}

// ─── Reglas ────────────────────────────────────────────────────────────────

async function menuReglas() {
  divider();
  const { opcion } = await inquirer.prompt([
    {
      type: "list",
      name: "opcion",
      message: "⚙️   Reglas — ¿Qué deseas configurar?",
      choices: [
        { name: "📈  Reglas de acumulación de puntos", value: "acumulacion" },
        { name: "📉  Reglas de redención de puntos",   value: "redencion" },
        new inquirer.Separator(),
        { name: "⬅️   Volver al menú principal",       value: "volver" },
      ],
    },
  ]);

  switch (opcion) {
    case "acumulacion": await configurarAcumulacion(); break;
    case "redencion":   await configurarRedencion(); break;
    case "volver":      return menuPrincipal();
  }

  return menuReglas();
}

async function configurarAcumulacion() {
  divider();
  console.log("📈  Configurar reglas de acumulación\n");

  const { pointsPerUse, bonusMultiplier } = await inquirer.prompt([
    { type: "number", name: "pointsPerUse",     message: "Puntos por uso:",         validate: (v) => v > 0 || "Debe ser mayor a 0" },
    { type: "number", name: "bonusMultiplier",  message: "Multiplicador de bono:",  validate: (v) => v > 0 || "Debe ser mayor a 0" },
  ]);

  try {
    const result = pointsService.setAccumulationRules({ pointsPerUse, bonusMultiplier });
    success("Reglas de acumulación actualizadas");
    info("Puntos por uso",       result.pointsPerUse);
    info("Multiplicador de bono", result.bonusMultiplier);
  } catch (e) {
    error(e.message);
  }

  await pause();
}

async function configurarRedencion() {
  divider();
  console.log("📉  Configurar reglas de redención\n");

  const { pointsRequired, benefitValue } = await inquirer.prompt([
    { type: "number", name: "pointsRequired", message: "Puntos requeridos por redención:", validate: (v) => v > 0 || "Debe ser mayor a 0" },
    { type: "number", name: "benefitValue",   message: "Valor del beneficio ($):",         validate: (v) => v > 0 || "Debe ser mayor a 0" },
  ]);

  try {
    const result = pointsService.setRedemptionRules({ pointsRequired, benefitValue });
    success("Reglas de redención actualizadas");
    info("Puntos requeridos", result.pointsRequired);
    info("Valor del beneficio", `$${result.benefitValue.toFixed(2)}`);
  } catch (e) {
    error(e.message);
  }

  await pause();
}

// ─── Arranque ──────────────────────────────────────────────────────────────
menuPrincipal();