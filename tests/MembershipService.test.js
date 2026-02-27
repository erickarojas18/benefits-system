const MembershipService = require("../src/MembershipService");

// ─────────────────────────────────────────────
// MOCK del repositorio de membresías
// ─────────────────────────────────────────────
const createMockRepository = () => ({
  findById: jest.fn(),
  findAll: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
});

// ─────────────────────────────────────────────
// HU-1: Registrar nueva membresía
// ─────────────────────────────────────────────
describe("HU-1: Registrar nueva membresía", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new MembershipService(mockRepo);
  });

  test("CASO EXITOSO - Registra una membresía con datos válidos", () => {
    mockRepo.findById.mockReturnValue(null); // No existe previamente

    const data = { id: "M001", name: "Juan Pérez", email: "juan@mail.com", plan: "GOLD" };
    const result = service.registerMembership(data);

    expect(result.id).toBe("M001");
    expect(result.name).toBe("Juan Pérez");
    expect(result.active).toBe(true);
    expect(result.points).toBe(0);
    expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({ id: "M001" }));
  });

  test("CASO FALLIDO - Lanza error si los datos están incompletos", () => {
    const data = { id: "M001", name: "Juan Pérez" }; // Faltan email y plan

    expect(() => service.registerMembership(data)).toThrow(
      "Datos incompletos para registrar la membresía."
    );
    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  test("CASO FALLIDO - Lanza error si ya existe una membresía con ese ID", () => {
    mockRepo.findById.mockReturnValue({ id: "M001", name: "Existente" });

    const data = { id: "M001", name: "Juan Pérez", email: "juan@mail.com", plan: "GOLD" };

    expect(() => service.registerMembership(data)).toThrow(
      "Ya existe una membresía con el ID: M001"
    );
  });
});

// ─────────────────────────────────────────────
// HU-2: Activar / Desactivar membresía
// ─────────────────────────────────────────────
describe("HU-2: Activar y desactivar membresía", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new MembershipService(mockRepo);
  });

  test("CASO EXITOSO - Activa una membresía inactiva", () => {
    const membership = { id: "M002", name: "Ana López", active: false, points: 0 };
    mockRepo.findById.mockReturnValue(membership);

    const result = service.activateMembership("M002");

    expect(result.active).toBe(true);
    expect(mockRepo.update).toHaveBeenCalledWith(expect.objectContaining({ active: true }));
  });

  test("CASO FALLIDO - Lanza error al activar una membresía ya activa", () => {
    mockRepo.findById.mockReturnValue({ id: "M002", active: true });

    expect(() => service.activateMembership("M002")).toThrow(
      "La membresía ya está activa: M002"
    );
  });

  test("CASO EXITOSO - Desactiva una membresía activa", () => {
    const membership = { id: "M003", name: "Carlos Ruiz", active: true, points: 50 };
    mockRepo.findById.mockReturnValue(membership);

    const result = service.deactivateMembership("M003");

    expect(result.active).toBe(false);
    expect(mockRepo.update).toHaveBeenCalledWith(expect.objectContaining({ active: false }));
  });

  test("CASO FALLIDO - Lanza error al desactivar una membresía ya inactiva", () => {
    mockRepo.findById.mockReturnValue({ id: "M003", active: false });

    expect(() => service.deactivateMembership("M003")).toThrow(
      "La membresía ya está inactiva: M003"
    );
  });

  test("CASO FALLIDO - Lanza error si la membresía no existe", () => {
    mockRepo.findById.mockReturnValue(null);

    expect(() => service.activateMembership("INEXISTENTE")).toThrow(
      "Membresía no encontrada: INEXISTENTE"
    );
  });
});

// ─────────────────────────────────────────────
// HU-3: Consultar estado de membresía
// ─────────────────────────────────────────────
describe("HU-3: Consultar estado de membresía", () => {
  let service;
  let mockRepo;

  beforeEach(() => {
    mockRepo = createMockRepository();
    service = new MembershipService(mockRepo);
  });

  test("CASO EXITOSO - Retorna el estado correcto de la membresía", () => {
    const membership = {
      id: "M004",
      name: "Laura Mora",
      email: "laura@mail.com",
      plan: "SILVER",
      active: true,
      points: 200,
    };
    mockRepo.findById.mockReturnValue(membership);

    const status = service.getMembershipStatus("M004");

    expect(status.id).toBe("M004");
    expect(status.active).toBe(true);
    expect(status.points).toBe(200);
    expect(status.plan).toBe("SILVER");
  });

  test("CASO FALLIDO - Lanza error si la membresía no existe", () => {
    mockRepo.findById.mockReturnValue(null);

    expect(() => service.getMembershipStatus("NOEXISTE")).toThrow(
      "Membresía no encontrada: NOEXISTE"
    );
  });
});
