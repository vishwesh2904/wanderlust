module.exports.calculateWorkcationScore = (score) => {
  if (!score) return 0;

  let total = 0;
  let max = 0;

  const internetScore = Math.min((score.internetSpeed || 0) / 100, 1) * 30;
  total += internetScore;
  max += 30;

  total += score.workspaceAvailable ? 20 : 0;
  max += 20;

  const noiseMap = { Low: 20, Moderate: 10, High: 0 };
  total += noiseMap[score.noiseLevel] || 10;
  max += 20;

  const cafeScore = Math.min((score.nearbyCafes || 0) / 10, 1) * 15;
  total += cafeScore;
  max += 15;

  total += score.powerBackup ? 15 : 0;
  max += 15;

  return Math.round((total / max) * 100);
};

module.exports.calculateSustainabilityScore = (score) => {
  if (!score) return 0;

  const earned = [
    score.solarEnergy,
    score.waterConservation,
    score.wasteManagement,
    score.greenCertified,
  ].filter(Boolean).length;

  return Math.round((earned / 4) * 100);
};
