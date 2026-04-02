import type { SQL } from "@adscrush/db/drizzle";

export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type EmptyProps<T extends React.ElementType> = Omit<React.ComponentProps<T>, keyof React.ComponentProps<T>>;

export interface SearchParams {
  [key: string]: string | string[] | undefined;
  callbackUrl?: string;
}

export interface QueryBuilderOpts {
  where?: SQL;
  orderBy?: SQL;
  distinct?: boolean;
  nullish?: boolean;
}
