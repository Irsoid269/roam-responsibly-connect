import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { AdminLoading, AdminEmpty } from "@/components/admin/AdminTableState";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { MoreHorizontal, Eye, Shield, ShieldOff, UserX } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { AppRole } from "@/hooks/useAdminAuth";

const roleLabels: Record<AppRole, string> = {
  admin: "Admin",
  moderator: "Modérateur",
  user: "Utilisateur",
  organizer: "Organisateur",
  partner_manager: "Gestionnaire partenaires",
  support: "Support",
  finance: "Finance",
};

const assignableRoles: AppRole[] = [
  "admin",
  "moderator",
  "organizer",
  "partner_manager",
  "support",
  "finance",
];

interface UserProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  trips_count: number;
  total_carbon_saved: number;
  created_at: string;
  roles: AppRole[];
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [userForRole, setUserForRole] = useState<UserProfile | null>(null);

  const fetchUsers = async () => {
    try {
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch roles for each user
      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: rolesData } = await supabase.rpc("get_user_roles", {
            _user_id: profile.user_id,
          });

          return {
            ...profile,
            roles: (rolesData as AppRole[]) || [],
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role: role,
      });

      if (error) throw error;

      toast.success(`Rôle ${role} ajouté`);
      fetchUsers();
      setRoleDialogOpen(false);
    } catch (error: any) {
      console.error("Error adding role:", error);
      if (error.code === "23505") {
        toast.error("L'utilisateur a déjà ce rôle");
      } else {
        toast.error("Erreur lors de l'ajout du rôle");
      }
    }
  };

  const removeRole = async (userId: string, role: AppRole) => {
    try {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("role", role);

      if (error) throw error;

      toast.success(`Rôle ${role} retiré`);
      fetchUsers();
    } catch (error) {
      console.error("Error removing role:", error);
      toast.error("Erreur lors de la suppression du rôle");
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <AdminLayout
      title="Gestion des utilisateurs"
      description="Comptes voyageurs, rôles et impact carbone agrégé."
    >
      <div className="rounded-xl border border-border bg-background shadow-sm overflow-hidden">
        {loading ? (
          <AdminLoading />
        ) : users.length === 0 ? (
          <AdminEmpty title="Aucun utilisateur trouvé" />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Rôles</TableHead>
                <TableHead>Voyages</TableHead>
                <TableHead>CO₂ économisé</TableHead>
                <TableHead>Inscrit le</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback>
                          {getInitials(user.full_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {user.full_name || "Sans nom"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {user.bio?.slice(0, 30) || "Pas de bio"}
                          {user.bio && user.bio.length > 30 ? "..." : ""}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {user.roles.length === 0 ? (
                        <Badge variant="outline">Utilisateur</Badge>
                      ) : (
                        user.roles.map((role) => (
                          <Badge
                            key={role}
                            variant={role === "admin" ? "default" : "secondary"}
                          >
                            {roleLabels[role] || role}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{user.trips_count}</TableCell>
                  <TableCell>{user.total_carbon_saved} kg</TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(user.created_at), "dd/MM/yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setSelectedUser(user)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Voir profil
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setUserForRole(user);
                            setRoleDialogOpen(true);
                          }}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Gérer les rôles
                        </DropdownMenuItem>
                        {user.roles.includes("admin") && (
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => removeRole(user.user_id, "admin")}
                          >
                            <ShieldOff className="h-4 w-4 mr-2" />
                            Retirer admin
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* User Details Dialog */}
      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Profil utilisateur</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar_url || undefined} />
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedUser.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">
                    {selectedUser.full_name || "Sans nom"}
                  </h3>
                  <div className="flex gap-1 mt-1">
                    {selectedUser.roles.map((role) => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Bio</p>
                  <p className="font-medium">{selectedUser.bio || "Pas de bio"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Voyages</p>
                  <p className="font-medium">{selectedUser.trips_count}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">CO₂ économisé</p>
                  <p className="font-medium">{selectedUser.total_carbon_saved} kg</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inscrit le</p>
                  <p className="font-medium">
                    {format(new Date(selectedUser.created_at), "PPP", {
                      locale: fr,
                    })}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Role Management Dialog */}
      <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gérer les rôles</DialogTitle>
            <DialogDescription>
              Attribuez ou retirez des rôles à {userForRole?.full_name || "cet utilisateur"}
            </DialogDescription>
          </DialogHeader>
          {userForRole && (
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm font-medium">Rôles actuels</p>
                <div className="flex gap-2 flex-wrap">
                  {userForRole.roles.length === 0 ? (
                    <Badge variant="outline">Aucun rôle spécial</Badge>
                  ) : (
                    userForRole.roles.map((role) => (
                      <Badge
                        key={role}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => removeRole(userForRole.user_id, role)}
                      >
                        {role} ×
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Ajouter un rôle</p>
                <div className="flex gap-2 flex-wrap">
                  {assignableRoles
                    .filter((role) => !userForRole.roles.includes(role))
                    .map((role) => (
                      <Button
                        key={role}
                        size="sm"
                        variant="outline"
                        onClick={() => addRole(userForRole.user_id, role)}
                      >
                        <Shield className="h-4 w-4 mr-1" />
                        {roleLabels[role]}
                      </Button>
                    ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialogOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminUsers;
