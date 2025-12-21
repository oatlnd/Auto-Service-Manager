import { useUserRole } from "@/contexts/UserRoleContext";
import { USER_ROLES } from "@shared/schema";
import { Shield, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { queryClient } from "@/lib/queryClient";

export function RoleSelector() {
  const { role, setRole } = useUserRole();

  const handleRoleChange = (newRole: typeof USER_ROLES[number]) => {
    setRole(newRole);
    queryClient.invalidateQueries();
  };

  const getRoleBadgeVariant = () => {
    switch (role) {
      case "Admin":
        return "default";
      case "Manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2" data-testid="button-role-selector">
          <Shield className="w-4 h-4" />
          <Badge variant={getRoleBadgeVariant()} className="text-xs">
            {role}
          </Badge>
          <ChevronDown className="w-3 h-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {USER_ROLES.map((r) => (
          <DropdownMenuItem
            key={r}
            onClick={() => handleRoleChange(r)}
            className={role === r ? "bg-accent" : ""}
            data-testid={`menu-role-${r.toLowerCase().replace(" ", "-")}`}
          >
            {r}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
