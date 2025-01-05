"use client";

import { Button } from "@/components/ui/button";

import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { useState } from "react";
import {
  type Application,
  type ApplicationState,
  ApplicationStateSchema,
} from "../schema";
import { invalidateApplicationsList } from "./actions/revalidation";

export default function ApplicationUpdateState({
  application,
}: Readonly<{ application: Application }>) {
  const { isPending, mutate } =
    api.applications.updateApplicationState.useMutation({
      onSuccess: async () => {
        await invalidateApplicationsList();
      },
    });

  const [state, setState] = useState<ApplicationState>(
    application.applicationState ?? ApplicationStateSchema.enum.created,
  );

  const handleChange = (value: string) => {
    setState(value as ApplicationState);
  };

  const handleUpdateClick = () => {
    mutate({
      applicationId: application.folderId,
      state,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-2">
        <Label>Update State: </Label>
        <Select defaultValue={state} onValueChange={handleChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Application State" />
          </SelectTrigger>
          <SelectContent>
            {ApplicationStateSchema.options.map((state) => (
              <SelectItem value={state} key={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Button onClick={handleUpdateClick} disabled={isPending}>
        {isPending && <LoadingSpinner className="mr-2" />}
        {isPending ? "Updating..." : "Update State"}
      </Button>
    </>
  );
}
