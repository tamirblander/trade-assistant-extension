const { getUserTier } = require('./user-tiers');
const { canAccessFeature } = require('./feature-permissions');

class PermissionService {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  async getUserProfile(userId) {
    // Fetch user profile from your users table
    const { data, error } = await this.supabase
      .from('users')
      .select('id, is_premium, is_pro')
      .eq('id', userId)
      .single();
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  }

  async getUserTier(userId) {
    const profile = await this.getUserProfile(userId);
    if (!profile) return 'free';
    return getUserTier(profile);
  }

  async canAccess(userId, feature) {
    const tier = await this.getUserTier(userId);
    return canAccessFeature(tier, feature);
  }
}

module.exports = PermissionService; 