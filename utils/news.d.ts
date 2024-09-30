export type News = {
  id: string;
  rating?: number;
  title: string;
  caption: string;
  date: Date;
  link: string;
  provider: string;
  note: string;
  tags: string[];
  imgs?: string;
  html_body: string;
  text_body: string;
  used: boolean;
};
