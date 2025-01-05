import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ApplicationTimeline from "@/feature/application/components/application-timeline";
import {
  ApplicationEventSchema,
  type ApplicationEvent,
  type ApplicationState,
} from "@/feature/application/schema";
import gDriveService from "@/lib/google/drive";
import { api } from "@/trpc/server";
import { Link, SquareArrowOutUpRight } from "lucide-react";
import "react-vertical-timeline-component/style.min.css";
import { z } from "zod";

const applicationStates: ApplicationState[] = [
  "applied",
  "interview",
  "offer",
  "rejected",
];

export default async function ApplicationPage({
  params,
}: {
  params: Promise<{ applicationId: string }>;
}) {
  const applicationId = (await params).applicationId;

  const application = await api.applications.getApplicationById({
    applicationId,
  });

  const events: ApplicationEvent[] = z.array(ApplicationEventSchema).parse([
    {
      date: new Date(),
      title: "applied",
      content: "Applied for the job",
    },
    {
      date: new Date(),
      title: "interview",
      content: "Interview scheduled",
    },
  ]);

  return (
    <section className="flex flex-col gap-8 p-8">
      <div className="flex items-center gap-8">
        <div className="flex flex-1 flex-col gap-2">
          <h1 className="text-2xl font-bold" title="Job title">
            {application.jobTitle}
          </h1>
          <p className="text-xl text-gray-500" title="Company">
            {application.companyName}
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {application.jobDescriptionUrl ? (
            <Button variant="outline" className="flex justify-start" asChild>
              <a
                href={application.jobDescriptionUrl}
                title="Job description"
                target="_blank"
              >
                <Link size={64} /> Job Description
              </a>
            </Button>
          ) : null}
          <Button variant="outline" className="flex justify-start" asChild>
            <a
              href={gDriveService.getLinkFromFolderId(application.folderId)}
              title="Documents"
              target="_blank"
            >
              <SquareArrowOutUpRight size={24} />
              Documents
            </a>
          </Button>
        </div>
      </div>
      <div className="flex items-end gap-8 border-y py-8">
        <div className="flex flex-col gap-2">
          <Label>Update State: </Label>
          <Select>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Application State" />
            </SelectTrigger>
            <SelectContent>
              {applicationStates.map((state) => (
                <SelectItem value={state} key={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button>Update State</Button>
      </div>
      <ApplicationTimeline events={events} />
    </section>
  );
}
