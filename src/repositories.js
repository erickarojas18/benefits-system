/**
 * Repositorios en memoria
 * Simulan una base de datos durante la ejecución del programa.
 */

class MembershipRepository {
  constructor() {
    this.data = [];
  }

  findById(id) {
    return this.data.find((m) => m.id === id) || null;
  }

  findAll() {
    return [...this.data];
  }

  save(membership) {
    this.data.push(membership);
  }

  update(membership) {
    const index = this.data.findIndex((m) => m.id === membership.id);
    if (index !== -1) this.data[index] = membership;
  }
}

class MovementRepository {
  constructor() {
    this.data = [];
  }

  save(movement) {
    this.data.push(movement);
  }

  findByMemberId(memberId) {
    return this.data.filter((m) => m.memberId === memberId);
  }

  findAll() {
    return [...this.data];
  }
}

module.exports = { MembershipRepository, MovementRepository };