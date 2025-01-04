import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/server";
import {
  Archive,
  File,
  Link as LinkIcon,
  SquareArrowOutUpRight,
} from "lucide-react";
import Link from "next/link";
import { type Application } from "../schema";

export default async function ApplicationsList({
  folderId,
}: Readonly<{
  folderId: string;
}>) {
  const applications = await api.applications.getAllApplications({ folderId });

  return (
    <section className="flex flex-col gap-4 p-8">
      <h2 className="text-2xl font-semibold">Applications</h2>
      <ul className="flex flex-col gap-2">
        {applications.length > 0 ? (
          applications.map((application) => (
            <ApplicationItem key={application.folderId} {...application} />
          ))
        ) : (
          <p>No applications found</p>
        )}
      </ul>
    </section>
  );
}

function ApplicationItem(application: Readonly<Application>) {
  return (
    <li className="flex items-center gap-4 rounded border p-4">
      <div className="flex flex-1 gap-8">
        <div className="flex w-1/5 flex-col gap-1">
          <p className="text-xs text-gray-300">Company</p>
          <p>{application.companyName}</p>
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-xs text-gray-300">Job Title</p>
          <Link
            href={`/application/${application.folderId}`}
            className="hover:underline"
          >
            {application.jobTitle}
          </Link>
        </div>
        <div className="flex w-1/5 flex-col gap-1">
          <p className="text-xs text-gray-300">Status</p>
          <p>Interview</p>
        </div>
      </div>
      <div className="flex w-1/6 justify-end border-l pl-4">
        {application.jobDescriptionUrl ? (
          <Button variant="ghost" asChild title="Job Description">
            <a href={application.jobDescriptionUrl} target="_blank">
              <LinkIcon />
            </a>
          </Button>
        ) : null}
        <Button variant="ghost" asChild title="Document's Folder">
          <a
            href={`https://drive.google.com/drive/u/1/folders/${application.folderId}`}
            target="_blank"
          >
            <SquareArrowOutUpRight />
          </a>
        </Button>
        <Button variant="ghost">
          <File />
          <span className="sr-only">CV</span>
        </Button>
        <Button variant="ghost">
          <Archive />
          <span className="sr-only">Archive</span>
        </Button>
      </div>
    </li>
  );
}

export function ApplicationListSkeleton() {
  return (
    <section className="flex flex-col gap-4 p-8">
      <h2 className="text-2xl font-semibold">Applications</h2>
      <ul className="flex flex-col gap-2">
        <ApplicationItemSkeleton />
        <ApplicationItemSkeleton />
        <ApplicationItemSkeleton />
      </ul>
    </section>
  );
}

function ApplicationItemSkeleton() {
  return (
    <li className="flex items-center gap-4 rounded border p-4">
      <div className="flex flex-1 gap-8">
        <div className="flex w-1/5 flex-col gap-1">
          <p className="text-xs text-gray-300">Company</p>
          <Skeleton className="h-[16px] w-[100px] rounded-full" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <p className="text-xs text-gray-300">Job Title</p>
          <Skeleton className="h-[16px] w-[200px] rounded-full" />
        </div>
        <div className="flex w-1/5 flex-col gap-1">
          <p className="text-xs text-gray-300">Status</p>
          <Skeleton className="h-[16px] w-[100px] rounded-full" />
        </div>
      </div>
      <div className="flex w-1/6 justify-end border-l pl-4">
        <Button variant="ghost" title="Job Description" disabled>
          <LinkIcon />
        </Button>
        <Button variant="ghost" title="Document's Folder" disabled>
          <SquareArrowOutUpRight />
        </Button>
        <Button variant="ghost" disabled>
          <File />
          <span className="sr-only">CV</span>
        </Button>
        <Button variant="ghost" disabled>
          <Archive />
          <span className="sr-only">Archive</span>
        </Button>
      </div>
    </li>
  );
}
