const PointsService = require("../src/PointsService");

// ─────────────────────────────────────────────
// MOCKS de repositorios
// ─────────────────────────────────────────────
const createMockMembershipRepo = () => ({
  findById: jest.fn(),
  update: jest.fn(),
});

const createMockMovementRepo = () => ({
  save: jest.fn(),
  findByMemberId: jest.fn(),
  findAll: jest.fn(),
});

// ─────────────────────────────────────────────
// HU-6: Definir reglas de acumulación
// ─────────────────────────────────────────────
describe("HU-6: Definir reglas de acumulación", () => {
  let service;

  beforeEach(() => {
    service = new PointsService(createMockMembershipRepo(), createMockMovementRepo());
  });

  test("CASO EXITOSO - Define reglas de acumulación válidas", () => {
    const result = service.setAccumulationRules({ pointsPerUse: 20, bonusMultiplier: 2 });

    expect(result.pointsPerUse).toBe(20);
    expect(result.bonusMultiplier).toBe(2);
  });

  test("CASO FALLIDO - Lanza error si pointsPerUse es 0 o negativo", () => {
    expect(() => service.setAccumulationRules({ pointsPerUse: 0 })).toThrow(
      "Las reglas de acumulación son inválidas."
    );
  });

  test("CASO FALLIDO - Lanza error si no se pasan reglas", () => {
    expect(() => service.setAccumulationRules(null)).toThrow(
      "Las reglas de acumulación son inválidas."
    );
  });
});

// ─────────────────────────────────────────────
// HU-7: Definir reglas de redención
// ─────────────────────────────────────────────
describe("HU-7: Definir reglas de redención", () => {
  let service;

  beforeEach(() => {
    service = new PointsService(createMockMembershipRepo(), createMockMovementRepo());
  });

  test("CASO EXITOSO - Define reglas de redención válidas", () => {
    const result = service.setRedemptionRules({ pointsRequired: 50, benefitValue: 2.5 });

    expect(result.pointsRequired).toBe(50);
    expect(result.benefitValue).toBe(2.5);
  });

  test("CASO FALLIDO - Lanza error si pointsRequired es 0 o negativo", () => {
    expect(() => service.setRedemptionRules({ pointsRequired: -10 })).toThrow(
      "Las reglas de redención son inválidas."
    );
  });
});

// ─────────────────────────────────────────────
// HU-4: Acumular puntos
// ─────────────────────────────────────────────
describe("HU-4: Acumular puntos por uso del servicio", () => {
  let service;
  let mockMemberRepo;
  let mockMovementRepo;

  beforeEach(() => {
    mockMemberRepo = createMockMembershipRepo();
    mockMovementRepo = createMockMovementRepo();
    service = new PointsService(mockMemberRepo, mockMovementRepo);
  });

  test("CASO EXITOSO - Acumula puntos en una membresía activa", () => {
    const membership = { id: "M001", active: true, points: 0 };
    mockMemberRepo.findById.mockReturnValue(membership);

    const result = service.accumulatePoints("M001");

    expect(result.pointsEarned).toBe(10); // Valor por defecto
    expect(result.totalPoints).toBe(10);
    expect(mockMemberRepo.update).toHaveBeenCalled();
    expect(mockMovementRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: "ACCUMULATION", points: 10 })
    );
  });

  test("CASO EXITOSO - Aplica multiplicador de bono correctamente", () => {
    service.setAccumulationRules({ pointsPerUse: 10, bonusMultiplier: 3 });
    const membership = { id: "M001", active: true, points: 0 };
    mockMemberRepo.findById.mockReturnValue(membership);

    const result = service.accumulatePoints("M001");

    expect(result.pointsEarned).toBe(30); // 10 * 3
  });

  test("CASO FALLIDO - Lanza error si la membresía está inactiva", () => {
    mockMemberRepo.findById.mockReturnValue({ id: "M001", active: false, points: 0 });

    expect(() => service.accumulatePoints("M001")).toThrow(
      "No se pueden acumular puntos en una membresía inactiva."
    );
    expect(mockMovementRepo.save).not.toHaveBeenCalled();
  });

  test("CASO FALLIDO - Lanza error si la membresía no existe", () => {
    mockMemberRepo.findById.mockReturnValue(null);

    expect(() => service.accumulatePoints("NOEXISTE")).toThrow(
      "Membresía no encontrada: NOEXISTE"
    );
  });
});

// ─────────────────────────────────────────────
// HU-5: Redimir puntos
// ─────────────────────────────────────────────
describe("HU-5: Redimir puntos por beneficios", () => {
  let service;
  let mockMemberRepo;
  let mockMovementRepo;

  beforeEach(() => {
    mockMemberRepo = createMockMembershipRepo();
    mockMovementRepo = createMockMovementRepo();
    service = new PointsService(mockMemberRepo, mockMovementRepo);
  });

  test("CASO EXITOSO - Redime puntos suficientes y calcula el beneficio", () => {
    const membership = { id: "M002", active: true, points: 300 };
    mockMemberRepo.findById.mockReturnValue(membership);

    const result = service.redeemPoints("M002", 100);

    expect(result.pointsRedeemed).toBe(100);
    expect(result.benefitValue).toBe(5.0); // 1 * 5.0
    expect(result.remainingPoints).toBe(200);
    expect(mockMovementRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ type: "REDEMPTION", points: -100 })
    );
  });

  test("CASO EXITOSO - Redime múltiples bloques de puntos", () => {
    const membership = { id: "M002", active: true, points: 300 };
    mockMemberRepo.findById.mockReturnValue(membership);

    const result = service.redeemPoints("M002", 200);

    expect(result.benefitValue).toBe(10.0); // 2 * 5.0
    expect(result.remainingPoints).toBe(100);
  });

  test("CASO FALLIDO - Lanza error si los puntos son insuficientes", () => {
    mockMemberRepo.findById.mockReturnValue({ id: "M002", active: true, points: 50 });

    expect(() => service.redeemPoints("M002", 100)).toThrow(
      "Puntos insuficientes. Disponibles: 50, requeridos: 100."
    );
  });

  test("CASO FALLIDO - Lanza error si los puntos no son múltiplo del mínimo", () => {
    mockMemberRepo.findById.mockReturnValue({ id: "M002", active: true, points: 150 });

    expect(() => service.redeemPoints("M002", 75)).toThrow(
      "Los puntos deben ser múltiplo de 100."
    );
  });

  test("CASO FALLIDO - Lanza error si la membresía está inactiva", () => {
    mockMemberRepo.findById.mockReturnValue({ id: "M002", active: false, points: 200 });

    expect(() => service.redeemPoints("M002", 100)).toThrow(
      "No se pueden redimir puntos en una membresía inactiva."
    );
  });

  test("CASO FALLIDO - Lanza error si los puntos a redimir son 0 o negativos", () => {
    expect(() => service.redeemPoints("M002", 0)).toThrow(
      "La cantidad de puntos a redimir debe ser mayor a 0."
    );
  });
});

// ─────────────────────────────────────────────
// HU-8: Historial de movimientos
// ─────────────────────────────────────────────
describe("HU-8: Consultar historial de movimientos", () => {
  let service;
  let mockMemberRepo;
  let mockMovementRepo;

  beforeEach(() => {
    mockMemberRepo = createMockMembershipRepo();
    mockMovementRepo = createMockMovementRepo();
    service = new PointsService(mockMemberRepo, mockMovementRepo);
  });

  test("CASO EXITOSO - Retorna el historial de movimientos del miembro", () => {
    mockMemberRepo.findById.mockReturnValue({ id: "M003", active: true });
    const movements = [
      { memberId: "M003", type: "ACCUMULATION", points: 10 },
      { memberId: "M003", type: "REDEMPTION", points: -100 },
    ];
    mockMovementRepo.findByMemberId.mockReturnValue(movements);

    const history = service.getMovementHistory("M003");

    expect(history).toHaveLength(2);
    expect(history[0].type).toBe("ACCUMULATION");
    expect(mockMovementRepo.findByMemberId).toHaveBeenCalledWith("M003");
  });

  test("CASO EXITOSO - Retorna arreglo vacío si no hay movimientos", () => {
    mockMemberRepo.findById.mockReturnValue({ id: "M003", active: true });
    mockMovementRepo.findByMemberId.mockReturnValue([]);

    const history = service.getMovementHistory("M003");

    expect(history).toEqual([]);
  });

  test("CASO FALLIDO - Lanza error si la membresía no existe", () => {
    mockMemberRepo.findById.mockReturnValue(null);

    expect(() => service.getMovementHistory("NOEXISTE")).toThrow(
      "Membresía no encontrada: NOEXISTE"
    );
  });
});
