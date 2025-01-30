"use client";
import "@googleworkspace/drive-picker-element";
import React, {
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

type GoogleMimeType =
  | "application/vnd.google-apps.folder"
  | "application/vnd.google-apps.document";

export interface PickedEvent extends CustomEvent {
  type: "picker:picked";
  detail: {
    action: "picked";
    viewToken: [
      string,
      null,
      {
        parent: string;
        mimeTypes: string;
        selectFolder: boolean;
        dr: boolean;
      },
    ];
    docs: Array<{
      id: string;
      serviceId: string;
      mimeType: string;
      name: string;
      description: string;
      type: string;
      lastEditedUtc: number;
      iconUrl: string;
      url: string;
      embedUrl: string;
      driveSuccess: boolean;
      sizeBytes: number;
      parentId: string;
    }>;
  };
}

interface ErrorEvent extends CustomEvent {
  type: "picker:error";
  detail: {
    action: "picked";
    error: string;
  };
}

interface CancelledEvent extends CustomEvent {
  type: "picker:canceled";
  detail: {
    action: "cancel";
  };
}

export type PickerEvent = PickedEvent | ErrorEvent | CancelledEvent;

declare module "react" {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "drive-picker": DrivePickerAttributes;
      "drive-picker-docs-view": DrivePickerDocsViewAttributes;
    }
  }
}

interface DrivePickerAttributes extends React.HTMLAttributes<HTMLElement> {
  "app-id"?: string;
  "client-id"?: string;
  "developer-key"?: string;
  "hide-title-bar"?: "default" | "true" | "false";
  locale?: string;
  "max-items"?: number;
  "mine-only"?: boolean;
  multiselect?: boolean;
  "nav-hidden"?: boolean;
  "oauth-token"?: string;
  origin?: string;
  "relay-url"?: string;
  scope?: string;
  title?: string;
  visible?: boolean;
  ref?: React.RefObject<HTMLElement>;
}

interface DrivePickerDocsViewAttributes
  extends React.HTMLAttributes<HTMLElement> {
  "enable-drives"?: "default" | "true" | "false";
  "include-folders"?: "default" | "true" | "false";
  "mime-types"?: GoogleMimeType;
  parent?: string;
  mode?: "GRID" | "LIST";
  "owned-by-me"?: "default" | "true" | "false";
  query?: string;
  "select-folder-enabled"?: "default" | "true" | "false";
  starred?: "default" | "true" | "false";
  "view-id"?: string;
}

export function FilePicker({
  appId,
  oauthToken,
  parent,
  trigger,
  onPicked,
  mimeType,
  disabled,
  multiselect,
}: {
  appId: string;
  oauthToken: string;
  trigger: React.ReactElement;
  parent?: string;
  onPicked?: (e: PickedEvent) => void;
  mimeType: GoogleMimeType;
  disabled?: boolean;
  multiselect?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {React.cloneElement(trigger, {
        onClick: () => setIsOpen(true),
        disabled,
      })}
      {isOpen ? (
        <FilePickerContainer
          app-id={appId}
          oauth-token={oauthToken}
          multiselect={multiselect}
          onPicked={(e) => {
            if (onPicked) {
              onPicked(e);
            }
            setIsOpen(false);
          }}
          onCanceled={() => {
            setIsOpen(false);
          }}
        >
          <drive-picker-docs-view
            enable-drives="false"
            select-folder-enabled={
              mimeType === "application/vnd.google-apps.folder"
                ? "true"
                : "default"
            }
            mime-types={mimeType}
            parent={parent ?? "root"}
          ></drive-picker-docs-view>
        </FilePickerContainer>
      ) : null}
    </div>
  );
}

function FilePickerContainer(
  props: PropsWithChildren<
    DrivePickerAttributes & {
      onCanceled?: () => void;
      onPicked?: (e: PickedEvent) => void;
    }
  >,
) {
  const { onPicked, onCanceled, ...rest } = props;
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const handler = (e: PickerEvent) => {
      if (onPicked) {
        onPicked(e as PickedEvent);
      }
    };

    const closeHandler = (e: CancelledEvent) => {
      if (onCanceled) {
        onCanceled();
      }
    };
    ref.current.addEventListener("picker:picked", handler as EventListener);

    ref.current.addEventListener(
      "picker:canceled",
      closeHandler as EventListener,
    );

    return () => {
      ref.current?.removeEventListener(
        "picker:picked",
        handler as EventListener,
      );
      ref.current?.removeEventListener(
        "picker:canceled",
        closeHandler as EventListener,
      );
    };
  }, [onCanceled, onPicked]);
  return (
    <drive-picker {...rest} ref={ref}>
      {props.children}
    </drive-picker>
  );
}
