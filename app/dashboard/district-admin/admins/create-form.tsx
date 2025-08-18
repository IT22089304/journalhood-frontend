import { useState, useEffect } from "react";
import { useAuth } from "@/lib/firebase/auth-context";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { PhoneInput } from "@/components/ui/phone-input";
import { usePhoneValidation } from "@/hooks/use-phone-validation";
import type { SchoolOverview } from "@/hooks/use-district-overview";

interface CreateSchoolAdminFormProps {
  schools: SchoolOverview[];
  onSuccess: () => void;
  admin?: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    schoolId?: string;
  };
}

export function CreateSchoolAdminForm({ schools, onSuccess, admin }: CreateSchoolAdminFormProps) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    phone: admin?.phone || "",
    schoolId: admin?.schoolId || "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { validatePhoneForSubmission, resetValidation } = usePhoneValidation();

  // Update form fields if admin changes (for editing)
  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || "",
        email: admin.email || "",
        phone: admin.phone || "",
        schoolId: admin.schoolId || "",
      });
    } else {
      setFormData({ name: "", email: "", phone: "", schoolId: "" });
    }
  }, [admin]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Invalid email format";
    }
    if (!formData.schoolId) {
      errors.schoolId = "Please select a school";
    }
    if (formData.phone) {
      const phoneError = validatePhoneForSubmission(formData.phone);
      if (phoneError) {
        errors.phone = phoneError;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!user?.districtId) {
      toast({
        title: "Error",
        description: "District ID not found. Please try logging out and back in.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      if (admin && admin.id) {
        // Update existing admin
        await api.put(
          `/api/district-admin/update-school-admin/${admin.id}`,
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone?.trim(),
            districtId: user.districtId,
            schoolId: formData.schoolId,
          },
          token!
        );
        toast({
          title: "Success",
          description: "School administrator updated successfully",
        });
      } else {
        // Create new admin
        await api.post(
          "/api/district-admin/create-school-admin",
          {
            name: formData.name.trim(),
            email: formData.email.trim(),
            phone: formData.phone?.trim(),
            districtId: user.districtId,
            schoolId: formData.schoolId,
          },
          token!
        );
        toast({
          title: "Success",
          description: "School administrator created successfully",
        });
      }
      onSuccess();
    } catch (error) {
      console.error("Error saving admin:", error);
      let errorMessage = admin ? "Failed to update administrator" : "Failed to create administrator";
      let errorDetails = "";
      if (error instanceof Error) {
        try {
          const parsed = JSON.parse(error.message);
          if (parsed.code === 'auth/email-already-exists') {
            errorMessage = "Email Already Registered";
            errorDetails = parsed.message;
            setFormData(prev => ({ ...prev, email: "" }));
            setFormErrors(prev => ({
              ...prev,
              email: "This email is already registered. Please use a different email."
            }));
          } else if (parsed.code === 'auth/phone-number-already-exists') {
            errorMessage = "Phone Number Already Registered";
            errorDetails = parsed.message;
            setFormData(prev => ({ ...prev, phone: "" }));
            setFormErrors(prev => ({
              ...prev,
              phone: "This phone number is already registered. Please use a different number."
            }));
          } else if (parsed.code === 'auth/invalid-phone-number') {
            errorMessage = "Invalid Phone Number";
            errorDetails = "Please enter a valid phone number in international format (e.g., +94771234567)";
            setFormErrors(prev => ({
              ...prev,
              phone: "Please use international format: +94771234567"
            }));
          } else if (parsed.code === 'email-send-failed') {
            errorMessage = admin ? "Admin Updated - Email Failed" : "Admin Created - Email Failed";
            errorDetails = parsed.message;
          } else {
            errorMessage = parsed.message || (admin ? "Failed to update administrator" : "Failed to create administrator");
            errorDetails = parsed.details || "";
          }
        } catch {
          errorMessage = error.message;
        }
      }
      toast({
        title: errorMessage,
        description: errorDetails,
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  return (
    <div>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter admin name"
            className={formErrors.name ? "border-red-500" : ""}
          />
          {formErrors.name && (
            <p className="text-sm text-red-500">{formErrors.name}</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="Enter admin email"
            className={formErrors.email ? "border-red-500" : ""}
          />
          {formErrors.email && (
            <p className="text-sm text-red-500">{formErrors.email}</p>
          )}
        </div>

        <PhoneInput
          value={formData.phone}
          onChange={(value) => setFormData({ ...formData, phone: value })}
          error={formErrors.phone}
          placeholder="+94771234567"
          label="Phone"
          required={false}
        />

        <div className="grid gap-2">
          <Label htmlFor="school">School</Label>
          <Select
            value={formData.schoolId}
            onValueChange={(value) => setFormData({ ...formData, schoolId: value })}
          >
            <SelectTrigger className={formErrors.schoolId ? "border-red-500" : ""}>
              <SelectValue placeholder="Select a school" />
            </SelectTrigger>
            <SelectContent>
              {schools.length === 0 ? (
                <div className="p-2 text-center text-gray-500">
                  <div>
                    <p>No schools available.</p>
                    <p className="text-sm mt-1">Please create a school in the Schools tab first.</p>
                  </div>
                </div>
              ) : (
                schools.map((school) => (
                  <SelectItem key={school.id} value={school.id}>
                    <div>
                      <div className="font-medium">{school.name}</div>
                      {school.admin ? (
                        <div className="text-sm text-red-500">Warning: School already has an admin ({school.admin.name})</div>
                      ) : (
                        <div className="text-sm text-gray-500">No admin assigned</div>
                      )}
                    </div>
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {formErrors.schoolId && (
            <p className="text-sm text-red-500">{formErrors.schoolId}</p>
          )}
          {formData.schoolId && schools.find(s => s.id === formData.schoolId)?.admin && (
            <p className="text-sm text-amber-500">Warning: This school already has an administrator. Creating a new admin will replace the existing one.</p>
          )}
        </div>
      </div>

      <DialogFooter>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {admin ? "Saving..." : "Creating..."}
            </>
          ) : (
            admin ? "Save Changes" : "Create Admin"
          )}
        </Button>
      </DialogFooter>
    </div>
  );
} 