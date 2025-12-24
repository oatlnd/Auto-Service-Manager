import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Plus, Pencil, Trash2, AlertCircle, UserCheck, UserX } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/contexts/UserRoleContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Technician } from "@shared/schema";

// Types updated for Australian English and specific skill sets
interface TechnicianFormData {
  name: string;
  phone: string;
  skill: "Mechanic" | "Repairer" | "Asst. Mechanic";
  isActive: boolean;
}

const initialFormData: TechnicianFormData = {
  name: "",
  phone: "",
  skill: "Mechanic",
  isActive: true,
};

export default function Technicians() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { isAdmin } = useUserRole();
  
  // State Management
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [deleteTechnicianId, setDeleteTechnicianId] = useState<string | null>(null);
  const [formData, setFormData] = useState<TechnicianFormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Data Fetching
  const { data: technicianList = [], isLoading, error } = useQuery<Technician[]>({
    queryKey: ["/api/technicians"],
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: async (data: TechnicianFormData) => {
      // Map skill to specialization for API
      const apiData = {
        name: data.name,
        phone: data.phone,
        specialization: data.skill,
        isActive: data.isActive,
      };
      return apiRequest("POST", "/api/technicians", apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      setIsCreateOpen(false);
      setFormData(initialFormData);
      toast({ title: "Success", description: "Technician added to the directory." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to add technician. Please try again.", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TechnicianFormData> }) => {
      // Map skill to specialization for API
      const apiData: any = {};
      if (data.name !== undefined) apiData.name = data.name;
      if (data.phone !== undefined) apiData.phone = data.phone;
      if (data.skill !== undefined) apiData.specialization = data.skill;
      if (data.isActive !== undefined) apiData.isActive = data.isActive;
      return apiRequest("PATCH", `/api/technicians/${id}`, apiData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      setIsEditOpen(false);
      setFormData(initialFormData);
      setEditingId(null);
      toast({ title: "Success", description: "Technician details updated." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update technician. Please try again.", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/technicians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/technicians"] });
      setDeleteTechnicianId(null);
      toast({ title: "Deleted", description: "Technician removed." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete technician. Please try again.", variant: "destructive" });
    },
  });

  const activeCount = technicianList.filter((t) => t.isActive).length;

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6 flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            <p>Error loading technician records. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold">Technician Management</h1>
          <p className="text-muted-foreground text-sm">Manage staff details and trade skills.</p>
        </div>
        {isAdmin && (
          <Button onClick={() => { setFormData(initialFormData); setIsCreateOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Technician
          </Button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-md bg-green-500/10 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Active Staff</p>
            </div>
          </CardContent>
        </Card>
        {/* ... Other cards follow same pattern ... */}
      </div>

      {/* Main Directory Table */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">Staff Directory</h2>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Staff ID</TableHead>
                <TableHead>Full Name</TableHead>
                <TableHead>Mobile Number</TableHead>
                <TableHead>Technician Skill</TableHead>
                <TableHead>Status</TableHead>
                {isAdmin && <TableHead className="text-right">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6}><Skeleton className="h-20 w-full" /></TableCell></TableRow>
              ) : technicianList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 6 : 5} className="text-center py-8 text-muted-foreground">
                    No technicians found. {isAdmin && "Add your first technician to get started."}
                  </TableCell>
                </TableRow>
              ) : (
                technicianList.map((tech) => (
                  <TableRow key={tech.id}>
                    <TableCell className="font-mono text-xs">#{tech.id}</TableCell>
                    <TableCell className="font-medium">{tech.name}</TableCell>
                    <TableCell>{tech.phone}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-primary/5">
                        {tech.specialization || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tech.isActive ? (
                        <Badge className="bg-green-600">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setEditingId(tech.id);
                            // Map specialization back to skill for form
                            // Default to "Mechanic" if specialization doesn't match expected values
                            let skill: "Mechanic" | "Repairer" | "Asst. Mechanic" = "Mechanic";
                            if (tech.specialization) {
                              const spec = tech.specialization.toLowerCase();
                              if (spec.includes("repairer") || spec.includes("repair")) {
                                skill = "Repairer";
                              } else if (spec.includes("asst") || spec.includes("assistant")) {
                                skill = "Asst. Mechanic";
                              } else {
                                skill = "Mechanic";
                              }
                            }
                            setFormData({ 
                              name: tech.name, 
                              phone: tech.phone, 
                              skill: skill, 
                              isActive: tech.isActive 
                            });
                            setIsEditOpen(true);
                          }}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleteTechnicianId(tech.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => { 
        if (!open) { 
          setIsCreateOpen(false); 
          setIsEditOpen(false); 
          setFormData(initialFormData);
          setEditingId(null);
        } 
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditOpen ? "Update Staff Member" : "Register New Technician"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name} 
                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                placeholder="e.g. Bruce Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input 
                id="phone" 
                value={formData.phone} 
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                placeholder="0400 000 000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="skill">Technician Skill</Label>
              <Select 
                value={formData.skill} 
                onValueChange={(value: any) => setFormData({ ...formData, skill: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select trade skill" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mechanic">Mechanic</SelectItem>
                  <SelectItem value="Repairer">Repairer</SelectItem>
                  <SelectItem value="Asst. Mechanic">Asst. Mechanic</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="active-status">Active Employment Status</Label>
              <Switch 
                id="active-status" 
                checked={formData.isActive} 
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsCreateOpen(false); setIsEditOpen(false); setFormData(initialFormData); setEditingId(null); }}>Cancel</Button>
            <Button 
              onClick={() => isEditOpen ? updateMutation.mutate({ id: editingId!, data: formData }) : createMutation.mutate(formData)}
              disabled={createMutation.isPending || updateMutation.isPending || !formData.name.trim() || !formData.phone.trim()}
            >
              {isEditOpen ? "Save Changes" : "Register Staff"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTechnicianId} onOpenChange={() => setDeleteTechnicianId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the staff member from the active directory. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteTechnicianId && deleteMutation.mutate(deleteTechnicianId)}
            >
              Delete Staff
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
