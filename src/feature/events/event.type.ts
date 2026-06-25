export type EventType = 'Competition' | 'Webinar' | 'Challenge';
export type EventStatus = 'Registration Open' | 'Upcoming' | 'Ongoing';
export type EventColor = 'coral' | 'purple' | 'amber';

export interface EventPrize {
  icon: string;
  name: string;
  value: string;
  color: string;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  target: Date;
  type: EventType;
  reward: string;
  status: EventStatus;
  color: EventColor;
  desc: string;
  participants: number;
  maxParticipants: number | null;
  duration: string;
  tags: string[];
  prizes: EventPrize[];
}
