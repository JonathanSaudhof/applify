"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  ApplicationStateSchema,
  CreateApplicationSchema,
  type CreateApplication,
} from "../schema";
import { invalidateApplicationsList } from "./actions/revalidation";

export default function CreateApplicationContainer() {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <Button
        onClick={() => {
          setOpen(true);
        }}
      >
        Create Application
      </Button>
      <CreateApplicationForm open={open} onOpenChange={setOpen} />
    </>
  );
}

function CreateApplicationForm({
  open,
  onOpenChange,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>) {
  const form = useForm<CreateApplication>({
    defaultValues: {
      companyName: "",
      jobTitle: "",
      jobDescriptionUrl: "",
      applicationState: ApplicationStateSchema.enum.created,
    },
    resolver: zodResolver(CreateApplicationSchema),
  });

  const { isPending, mutate } = api.applications.createApplication.useMutation({
    onSuccess: async () => {
      await invalidateApplicationsList();
      handleOpenChange(false);
    },
  });

  const handleSaveClick = async (application: CreateApplication) => {
    mutate(application);
  };

  const handleOpenChange = (open: boolean) => {
    form.reset();
    onOpenChange(open);
  };

  const handleCancelClick = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild></DialogTrigger>
      <DialogContent className="">
        <DialogHeader>
          <DialogTitle>Create Application</DialogTitle>
          <DialogDescription>
            Create a new CV copy for a position
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSaveClick)}
            className="flex h-[350px] flex-col space-y-4"
            id="create-application-form"
          >
            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Apple Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Software Developer" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="jobDescriptionUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://www.apple.com/jobs"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="applicationState"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Application State:</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder="Select Application State"
                          defaultValue={ApplicationStateSchema.enum.created}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {ApplicationStateSchema.options.map((state) => (
                        <SelectItem value={state} key={state}>
                          {state}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="submit"
            form="create-application-form"
            disabled={isPending}
          >
            {isPending && <LoadingSpinner className="mr-2" />}
            {isPending ? "Saving..." : "Save"}
          </Button>
          <Button variant="secondary" type="button" onClick={handleCancelClick}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
