/**
 * MembershipService
 * Gestiona las membresías del sistema de beneficios.
 * Historias de usuario: 1, 2, 3
 */
class MembershipService {
  constructor(membershipRepository) {
    this.membershipRepository = membershipRepository;
  }

  /**
   * HU-1: Registrar una nueva membresía
   * @param {Object} data - { id, name, email, plan }
   * @returns {Object} membresía creada
   */
  registerMembership(data) {
    if (!data || !data.id || !data.name || !data.email || !data.plan) {
      throw new Error("Datos incompletos para registrar la membresía.");
    }

    const existing = this.membershipRepository.findById(data.id);
    if (existing) {
      throw new Error(`Ya existe una membresía con el ID: ${data.id}`);
    }

    const membership = {
      id: data.id,
      name: data.name,
      email: data.email,
      plan: data.plan,
      active: true,
      points: 0,
      createdAt: new Date().toISOString(),
    };

    this.membershipRepository.save(membership);
    return membership;
  }

  /**
   * HU-2: Activar una membresía
   * @param {string} id
   * @returns {Object} membresía actualizada
   */
  activateMembership(id) {
    const membership = this.membershipRepository.findById(id);
    if (!membership) {
      throw new Error(`Membresía no encontrada: ${id}`);
    }
    if (membership.active) {
      throw new Error(`La membresía ya está activa: ${id}`);
    }
    membership.active = true;
    this.membershipRepository.update(membership);
    return membership;
  }

  /**
   * HU-2: Desactivar una membresía
   * @param {string} id
   * @returns {Object} membresía actualizada
   */
  deactivateMembership(id) {
    const membership = this.membershipRepository.findById(id);
    if (!membership) {
      throw new Error(`Membresía no encontrada: ${id}`);
    }
    if (!membership.active) {
      throw new Error(`La membresía ya está inactiva: ${id}`);
    }
    membership.active = false;
    this.membershipRepository.update(membership);
    return membership;
  }

  /**
   * HU-3: Consultar el estado de una membresía
   * @param {string} id
   * @returns {Object} estado de la membresía
   */
  getMembershipStatus(id) {
    const membership = this.membershipRepository.findById(id);
    if (!membership) {
      throw new Error(`Membresía no encontrada: ${id}`);
    }
    return {
      id: membership.id,
      name: membership.name,
      plan: membership.plan,
      active: membership.active,
      points: membership.points,
    };
  }
}

module.exports = MembershipService;
