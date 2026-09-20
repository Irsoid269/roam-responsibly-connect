import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export type AppRole =
  | "admin"
  | "moderator"
  | "user"
  | "organizer"
  | "partner_manager"
  | "support"
  | "finance";

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isModerator: boolean;
  roles: AppRole[];
  loading: boolean;
  checkRole: (role: AppRole) => boolean;
  hasAnyRole: (allowed: AppRole[]) => boolean;
}

export const useAdminAuth = (): UseAdminAuthReturn => {
  const { user, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user) {
        setRoles([]);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_user_roles", {
          _user_id: user.id,
        });

        if (error) {
          console.error("Error fetching user roles:", error);
          setRoles([]);
        } else {
          setRoles((data as AppRole[]) || []);
        }
      } catch (err) {
        console.error("Error fetching roles:", err);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchRoles();
    }
  }, [user, authLoading]);

  const checkRole = (role: AppRole): boolean => {
    return roles.includes(role);
  };

  const isAdmin = roles.includes("admin");
  const isModerator = roles.includes("moderator") || isAdmin;

  const hasAnyRole = (allowed: AppRole[]): boolean =>
    isAdmin || allowed.some((role) => roles.includes(role));

  return {
    isAdmin,
    isModerator,
    roles,
    loading: authLoading || loading,
    checkRole,
    hasAnyRole,
  };
};
