const ReportService = require("../src/ReportService");

// ─────────────────────────────────────────────
// MOCKS de repositorios
// ─────────────────────────────────────────────
const createMockMembershipRepo = () => ({
  findAll: jest.fn(),
});

const createMockMovementRepo = () => ({
  findAll: jest.fn(),
});

// ─────────────────────────────────────────────
// HU-9: Reporte de membresías activas e inactivas
// ─────────────────────────────────────────────
describe("HU-9: Reporte de membresías activas e inactivas", () => {
  let service;
  let mockMemberRepo;
  let mockMovementRepo;

  beforeEach(() => {
    mockMemberRepo = createMockMembershipRepo();
    mockMovementRepo = createMockMovementRepo();
    service = new ReportService(mockMemberRepo, mockMovementRepo);
  });

  test("CASO EXITOSO - Genera reporte con membresías activas e inactivas", () => {
    const memberships = [
      { id: "M001", name: "Ana", active: true },
      { id: "M002", name: "Luis", active: true },
      { id: "M003", name: "Sara", active: false },
    ];
    mockMemberRepo.findAll.mockReturnValue(memberships);

    const report = service.getMembershipReport();

    expect(report.totalActive).toBe(2);
    expect(report.totalInactive).toBe(1);
    expect(report.active).toHaveLength(2);
    expect(report.inactive).toHaveLength(1);
    expect(mockMemberRepo.findAll).toHaveBeenCalled();
  });

  test("CASO EXITOSO - Todas las membresías son activas", () => {
    mockMemberRepo.findAll.mockReturnValue([
      { id: "M001", active: true },
      { id: "M002", active: true },
    ]);

    const report = service.getMembershipReport();

    expect(report.totalActive).toBe(2);
    expect(report.totalInactive).toBe(0);
    expect(report.inactive).toHaveLength(0);
  });

  test("CASO EXITOSO - No hay membresías registradas", () => {
    mockMemberRepo.findAll.mockReturnValue([]);

    const report = service.getMembershipReport();

    expect(report.totalActive).toBe(0);
    expect(report.totalInactive).toBe(0);
    expect(report.active).toEqual([]);
    expect(report.inactive).toEqual([]);
  });

  test("CASO FALLIDO - Retorna reporte vacío si el repositorio retorna null", () => {
    mockMemberRepo.findAll.mockReturnValue(null);

    const report = service.getMembershipReport();

    expect(report.totalActive).toBe(0);
    expect(report.totalInactive).toBe(0);
  });
});

// ─────────────────────────────────────────────
// HU-10: Reporte de puntos acumulados y redimidos
// ─────────────────────────────────────────────
describe("HU-10: Reporte de puntos acumulados y redimidos", () => {
  let service;
  let mockMemberRepo;
  let mockMovementRepo;

  beforeEach(() => {
    mockMemberRepo = createMockMembershipRepo();
    mockMovementRepo = createMockMovementRepo();
    service = new ReportService(mockMemberRepo, mockMovementRepo);
  });

  test("CASO EXITOSO - Calcula correctamente los totales de puntos", () => {
    const movements = [
      { type: "ACCUMULATION", points: 10 },
      { type: "ACCUMULATION", points: 20 },
      { type: "REDEMPTION", points: -100 },
    ];
    mockMovementRepo.findAll.mockReturnValue(movements);

    const report = service.getPointsReport();

    expect(report.totalAccumulated).toBe(30);
    expect(report.totalRedeemed).toBe(100);
    expect(report.movementCount).toBe(3);
    expect(report.accumulationCount).toBe(2);
    expect(report.redemptionCount).toBe(1);
  });

  test("CASO EXITOSO - Solo hay acumulaciones sin redenciones", () => {
    const movements = [
      { type: "ACCUMULATION", points: 10 },
      { type: "ACCUMULATION", points: 10 },
    ];
    mockMovementRepo.findAll.mockReturnValue(movements);

    const report = service.getPointsReport();

    expect(report.totalAccumulated).toBe(20);
    expect(report.totalRedeemed).toBe(0);
    expect(report.redemptionCount).toBe(0);
  });

  test("CASO EXITOSO - No hay movimientos registrados", () => {
    mockMovementRepo.findAll.mockReturnValue([]);

    const report = service.getPointsReport();

    expect(report.totalAccumulated).toBe(0);
    expect(report.totalRedeemed).toBe(0);
    expect(report.movementCount).toBe(0);
  });

  test("CASO FALLIDO - Retorna reporte vacío si el repositorio retorna null", () => {
    mockMovementRepo.findAll.mockReturnValue(null);

    const report = service.getPointsReport();

    expect(report.totalAccumulated).toBe(0);
    expect(report.totalRedeemed).toBe(0);
  });
});
