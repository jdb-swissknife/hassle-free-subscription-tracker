import { supabase } from '@/lib/supabase';

export type SignupType = 'email_signup' | 'full_registration' | 'interest';

// Track early adopter signups
export const trackEarlyAdopterSignup = async (
  email?: string,
  userId?: string,
  signupType: SignupType = 'email_signup'
) => {
  try {
    const { error } = await supabase
      .from('early_adopter_signups')
      .insert({
        user_id: userId,
        email: email,
        signup_type: signupType
      });

    if (error) {
      console.error('Error tracking signup:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error tracking signup:', error);
    return false;
  }
};

// Check if user has already been tracked
export const hasUserBeenTracked = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('early_adopter_signups')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) {
      console.error('Error checking user tracking:', error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error('Error checking user tracking:', error);
    return false;
  }
};

// Get current signup statistics
export const getSignupStats = async () => {
  try {
    const { count, error } = await supabase
      .from('early_adopter_signups')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting signup stats:', error);
      return { count: 0, error };
    }

    return { count: count || 0, error: null };
  } catch (error) {
    console.error('Error getting signup stats:', error);
    return { count: 0, error };
  }
};