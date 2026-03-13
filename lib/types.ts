export type DemoImage = {
  id: string;
  url: string;
  path?: string | null;
  sortOrder: number;
  fileName: string;
};

export type Feedback = {
  id: string;
  demoId: string;
  nickname: string;
  content: string;
  deviceType: string;
  createdAt: string;
};

export type Demo = {
  id: string;
  creatorId?: string | null;
  title: string;
  description: string;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
  images: DemoImage[];
  feedback: Feedback[];
};

export type Database = {
  demos: Demo[];
};
