/**
 * PointsService
 * Gestiona la acumulación y redención de puntos.
 * Historias de usuario: 4, 5, 6, 7, 8
 */
class PointsService {
  constructor(membershipRepository, movementRepository) {
    this.membershipRepository = membershipRepository;
    this.movementRepository = movementRepository;

    // HU-6: Reglas de acumulación por defecto
    this.accumulationRules = {
      pointsPerUse: 10,
      bonusMultiplier: 1,
    };

    // HU-7: Reglas de redención por defecto
    this.redemptionRules = {
      pointsRequired: 100,
      benefitValue: 5.0,
    };
  }

  /**
   * HU-6: Definir reglas de acumulación de puntos
   * @param {Object} rules - { pointsPerUse, bonusMultiplier }
   */
  setAccumulationRules(rules) {
    if (!rules || rules.pointsPerUse === undefined || rules.pointsPerUse <= 0) {
      throw new Error("Las reglas de acumulación son inválidas.");
    }
    this.accumulationRules = { ...this.accumulationRules, ...rules };
    return this.accumulationRules;
  }

  /**
   * HU-7: Definir reglas de redención de puntos
   * @param {Object} rules - { pointsRequired, benefitValue }
   */
  setRedemptionRules(rules) {
    if (!rules || rules.pointsRequired === undefined || rules.pointsRequired <= 0) {
      throw new Error("Las reglas de redención son inválidas.");
    }
    this.redemptionRules = { ...this.redemptionRules, ...rules };
    return this.redemptionRules;
  }

  /**
   * HU-4: Acumular puntos por uso del servicio
   * @param {string} memberId
   * @returns {Object} resultado con puntos ganados y total
   */
  accumulatePoints(memberId) {
    const membership = this.membershipRepository.findById(memberId);
    if (!membership) {
      throw new Error(`Membresía no encontrada: ${memberId}`);
    }
    if (!membership.active) {
      throw new Error(`No se pueden acumular puntos en una membresía inactiva.`);
    }

    const pointsEarned =
      this.accumulationRules.pointsPerUse * this.accumulationRules.bonusMultiplier;

    membership.points += pointsEarned;
    this.membershipRepository.update(membership);

    const movement = {
      memberId,
      type: "ACCUMULATION",
      points: pointsEarned,
      date: new Date().toISOString(),
      description: "Acumulación por uso del servicio",
    };
    this.movementRepository.save(movement);

    return { pointsEarned, totalPoints: membership.points };
  }

  /**
   * HU-5: Redimir puntos por beneficios
   * @param {string} memberId
   * @param {number} pointsToRedeem
   * @returns {Object} resultado con puntos redimidos y beneficio obtenido
   */
  redeemPoints(memberId, pointsToRedeem) {
    if (!pointsToRedeem || pointsToRedeem <= 0) {
      throw new Error("La cantidad de puntos a redimir debe ser mayor a 0.");
    }
    if (pointsToRedeem % this.redemptionRules.pointsRequired !== 0) {
      throw new Error(
        `Los puntos deben ser múltiplo de ${this.redemptionRules.pointsRequired}.`
      );
    }

    const membership = this.membershipRepository.findById(memberId);
    if (!membership) {
      throw new Error(`Membresía no encontrada: ${memberId}`);
    }
    if (!membership.active) {
      throw new Error(`No se pueden redimir puntos en una membresía inactiva.`);
    }
    if (membership.points < pointsToRedeem) {
      throw new Error(
        `Puntos insuficientes. Disponibles: ${membership.points}, requeridos: ${pointsToRedeem}.`
      );
    }

    const benefit =
      (pointsToRedeem / this.redemptionRules.pointsRequired) *
      this.redemptionRules.benefitValue;

    membership.points -= pointsToRedeem;
    this.membershipRepository.update(membership);

    const movement = {
      memberId,
      type: "REDEMPTION",
      points: -pointsToRedeem,
      date: new Date().toISOString(),
      description: `Redención de ${pointsToRedeem} puntos por beneficio`,
    };
    this.movementRepository.save(movement);

    return { pointsRedeemed: pointsToRedeem, benefitValue: benefit, remainingPoints: membership.points };
  }

  /**
   * HU-8: Consultar historial de movimientos de puntos
   * @param {string} memberId
   * @returns {Array} lista de movimientos
   */
  getMovementHistory(memberId) {
    const membership = this.membershipRepository.findById(memberId);
    if (!membership) {
      throw new Error(`Membresía no encontrada: ${memberId}`);
    }

    const movements = this.movementRepository.findByMemberId(memberId);
    return movements;
  }
}

module.exports = PointsService;
