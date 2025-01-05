"use client";
import { Play } from "lucide-react";
import {
  VerticalTimeline,
  VerticalTimelineElement,
} from "react-vertical-timeline-component";
import "react-vertical-timeline-component/style.min.css";
import { type ApplicationEvent } from "../schema";

export default function ApplicationTimeline({
  events,
}: {
  events: ApplicationEvent[];
}) {
  return (
    <div className="flex flex-col gap-8">
      <h2 className="text-2xl font-bold">Timeline</h2>
      {events.length ? (
        <VerticalTimeline
          animate={false}
          layout="1-column-left"
          lineColor="gray"
          className="!m-0 !w-full !max-w-full"
        >
          {events.map((event, index) => (
            <TimelineElement {...event} key={index} />
          ))}
        </VerticalTimeline>
      ) : (
        <div>No events found</div>
      )}
    </div>
  );
}

function TimelineElement(event: ApplicationEvent) {
  return (
    <VerticalTimelineElement
      contentArrowStyle={{ borderRight: "10px solid  lightgray" }}
      date={event.date.toDateString()}
      textClassName="border border-gray-500"
      iconClassName="border bg-gray-100 border-gray-200 p-2"
      icon={<Play />}
    >
      <h3 className="text-2xl">{event.title}</h3>
      <p>{event.content}</p>
    </VerticalTimelineElement>
  );
}
