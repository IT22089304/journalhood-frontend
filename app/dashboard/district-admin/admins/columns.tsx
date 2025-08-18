import type { SchoolAdmin } from "@/lib/types";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export const getColumns = (onDelete: (admin: SchoolAdmin) => Promise<void>) => [
  {
    key: "name" as keyof SchoolAdmin,
    label: "Name",
    render: (value: string | undefined, admin: SchoolAdmin) => (
      <div>
        <div className="font-medium">{value || "Not Assigned"}</div>
        <div className="text-sm text-gray-500">{admin.email || "No email"}</div>
      </div>
    ),
  },
  {
    key: "schoolName" as keyof SchoolAdmin,
    label: "School",
    render: (value: string | undefined) => value || "Not Assigned",
  },
  {
    key: "status" as keyof SchoolAdmin,
    label: "Status",
    render: (value: string | undefined) => {
      const status = value || "active";
      return (
        <span className={`px-2 py-1 rounded-full text-xs ${
          status === "active" 
            ? "bg-green-100 text-green-700" 
            : "bg-red-100 text-red-700"
        }`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
  },
  {
    key: "actions" as keyof SchoolAdmin,
    label: "Actions",
    render: (_: any, admin: SchoolAdmin) => (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-1" /> Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the school admin
              account for {admin.name} and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onDelete(admin);
              }}
            >
              Delete Admin
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    ),
  },
]; 