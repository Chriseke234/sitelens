import React from "react";
import { NewProjectWizard } from "@/components/projects/new-project-wizard";

export const metadata = {
  title: "New AI Workspace | Aigenstra",
  description: "Create a new AI Product Engineering and Audit Workspace.",
};

export default function NewProjectPage() {
  return (
    <div className="py-4">
      <NewProjectWizard />
    </div>
  );
}
