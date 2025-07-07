export interface UrlReport {
  ID: number;
  url: string;
  status: "done" | "error" | "pending" | "running" | "queued";
  title: string;
  html_version: string;
  internal_links: number;
  external_links: number;
  broken_links: number;
  has_login_form: boolean;
  created_at: string;
  h1_count: number;
  h2_count: number;
  h3_count: number;
  h4_count: number;
  h5_count: number;
  h6_count: number;
}
