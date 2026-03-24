export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface ShortLink {
  id: number;
  original_url: string;
  short_code: string;
  title: string;
  created_at: string;
  is_active: boolean;
  click_count: number;
  short_url: string;
}

export interface ShortLinkDetail extends ShortLink {
  clicks_by_day: { date: string; count: number }[];
}

export interface DashboardStats {
  total_links: number;
  total_clicks: number;
  active_links: number;
  top_links: ShortLink[];
}

export interface AuthTokens {
  access: string;
  refresh: string;
}
