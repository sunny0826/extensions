import type { CreatePageParameters } from "@notionhq/client/build/src/api-endpoints";
import { format, subMinutes } from "date-fns";

import { _supportedPropTypes } from "..";

type FormatDatabasePropertyParams = {
  [T in DatabaseProperty["type"]]: [type: T, value: FormValueForDatabaseProperty<T>];
}[DatabaseProperty["type"]];
type PageProperty = CreatePageParameters["properties"][string];

export function formatDatabaseProperty(...[type, value]: FormatDatabasePropertyParams): PageProperty | undefined {
  switch (type) {
    case "title":
    case "rich_text":
      return formattedProperty(type, [{ text: { content: value } }]);
    case "number":
      return formattedProperty(type, parseFloat(value));
    case "date":
      if (!value) return;
      type DatePropertyTimeZone = Exclude<Extract<PageProperty, { type?: "date" }>["date"], null>["time_zone"];
      return formattedProperty(type, {
        start: format(subMinutes(value, new Date().getTimezoneOffset()), "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
        time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone as DatePropertyTimeZone,
      });
    case "select":
    case "status":
      return formattedProperty(type, { id: value });
    case "multi_select":
    case "relation":
    case "people":
      return formattedProperty(
        type,
        value.map((id) => ({ id })),
      );
    case "formula":
      return;
    case "checkbox":
      return formattedProperty(type, value);
    default:
      return formattedProperty(type, value);
  }
}

const formattedProperty = <T extends DatabaseProperty["type"], V>(type: T, value: V) =>
  ({
    [type]: value,
  }) as { [K in T]: V };

// prettier-ignore
export type FormValueForDatabaseProperty<T extends DatabaseProperty['type']> =
      T extends "date" ? Date | null
    : T extends "checkbox" ? boolean
    : T extends "multi_select" | "relation" | "people" ? string[]
    : T extends "formula" ? null
    : string;
// all possible types:
// "number" | "title" | "rich_text" | "url" | "email" | "phone_number" | "date" | "checkbox" | "select" | "formula" | "people" | "relation" | "multi_select" | "rollup" | "files" | "created_by" | "created_time" | "last_edited_by" | "last_edited_time"

export interface DatabaseProperty {
  id: string;
  type: (typeof _supportedPropTypes)[number];
  name: string;
  options: DatabasePropertyOption[];
  relation_id?: string;
}
export interface DatabasePropertyOption {
  id?: string;
  name: string;
  color?: string;
  icon?: string;
}
