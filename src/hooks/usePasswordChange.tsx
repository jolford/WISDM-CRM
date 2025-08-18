import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const usePasswordChange = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const validatePasswords = (data: PasswordChangeData): string | null => {
    if (!data.currentPassword || !data.newPassword || !data.confirmPassword) {
      return 'All password fields are required';
    }
    
    if (data.newPassword.length < 8) {
      return 'New password must be at least 8 characters long';
    }
    
    if (data.newPassword !== data.confirmPassword) {
      return 'New passwords do not match';
    }
    
    // Check password strength
    const hasUpperCase = /[A-Z]/.test(data.newPassword);
    const hasLowerCase = /[a-z]/.test(data.newPassword);
    const hasNumbers = /\d/.test(data.newPassword);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(data.newPassword);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      return 'Password must include uppercase, lowercase, numbers, and special characters';
    }
    
    return null;
  };

  const changePassword = async (data: PasswordChangeData): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Validate passwords
      const validationError = validatePasswords(data);
      if (validationError) {
        toast({
          title: 'Validation Error',
          description: validationError,
          variant: 'destructive',
        });
        return false;
      }

      // Attempt to update password
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) {
        toast({
          title: 'Password Change Failed',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      toast({
        title: 'Password Updated',
        description: 'Your password has been successfully updated',
      });
      
      return true;
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while changing your password',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    changePassword,
    loading,
  };
};