const { USER_TIERS } = require('./user-tiers');

const FEATURE_TIERS = {
  'premium-feature': [USER_TIERS.PREMIUM, USER_TIERS.PRO],
  'pro-feature': [USER_TIERS.PRO],
  // Add more features as needed
};

function canAccessFeature(tier, feature) {
  return FEATURE_TIERS[feature]?.includes(tier);
}

module.exports = { FEATURE_TIERS, canAccessFeature }; 