export type CurrentUser = {
  avatarUrl?: string;
  name: string;
};

export type HomeTableStatus = 'free' | 'reserved' | 'occupied'

export type BabyfootCardData = {
  accent: string;
  id: number;
  location: string;
  name: string;
  status: HomeTableStatus;
};
