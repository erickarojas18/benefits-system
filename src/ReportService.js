/**
 * ReportService
 * Genera reportes del sistema de membresías y puntos.
 * Historias de usuario: 9, 10
 */
class ReportService {
  constructor(membershipRepository, movementRepository) {
    this.membershipRepository = membershipRepository;
    this.movementRepository = movementRepository;
  }

  /**
   * HU-9: Reporte de membresías activas e inactivas
   * @returns {Object} reporte con listas de membresías activas e inactivas
   */
  getMembershipReport() {
    const allMemberships = this.membershipRepository.findAll();

    if (!allMemberships || allMemberships.length === 0) {
      return { active: [], inactive: [], totalActive: 0, totalInactive: 0 };
    }

    const active = allMemberships.filter((m) => m.active);
    const inactive = allMemberships.filter((m) => !m.active);

    return {
      active,
      inactive,
      totalActive: active.length,
      totalInactive: inactive.length,
    };
  }

  /**
   * HU-10: Reporte de puntos acumulados y redimidos
   * @returns {Object} reporte con totales de puntos acumulados y redimidos
   */
  getPointsReport() {
    const allMovements = this.movementRepository.findAll();

    if (!allMovements || allMovements.length === 0) {
      return { totalAccumulated: 0, totalRedeemed: 0, movementCount: 0 };
    }

    const accumulations = allMovements.filter((m) => m.type === "ACCUMULATION");
    const redemptions = allMovements.filter((m) => m.type === "REDEMPTION");

    const totalAccumulated = accumulations.reduce((sum, m) => sum + m.points, 0);
    const totalRedeemed = redemptions.reduce((sum, m) => sum + Math.abs(m.points), 0);

    return {
      totalAccumulated,
      totalRedeemed,
      movementCount: allMovements.length,
      accumulationCount: accumulations.length,
      redemptionCount: redemptions.length,
    };
  }
}

module.exports = ReportService;
