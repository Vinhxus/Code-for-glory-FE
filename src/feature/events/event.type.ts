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
  /** Link tới trang chính thức của contest bên ngoài (nếu có). Chỉ set cho
   * các Competition có 1 sự kiện thật tương ứng — không bịa link cho
   * Webinar/Challenge nội bộ của platform. */
  officialLink?: string;
}