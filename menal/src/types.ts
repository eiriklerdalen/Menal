export type Entry = {
  id: number;
  calendar_id: number;
  date: string;
  rating: number;
};

export type JournalEntry = {
    id: number;
    profile_id: number;
    date: string;
    journal_text: string;
};

export type Calendar = {
  id: number;
  profile_id: number;
  name: string;
  max_rating: number;
  position: number;
  oldestEntryDate: string;
};

export type Year = {
  year: string;
};

export type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export type User = {
  id: number;
  userId: number;
  name: string;
  email: string;
}