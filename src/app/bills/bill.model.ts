import { firestore } from "firebase";

export interface Bill {
    id?: string;
    name: string;
    amount: number;
    payment: Payment;
    shared_with: FriendDebt[];
    due_date?: firestore.Timestamp;
    notes?: string;
    account_id?: string;
    link?: string;
}

export interface Account {
    id?: string;
    name: string;
    bills: Bill[];
    rule?: MonthlyRule | WeeklyRule | YearlyRule;
    notes?: string;
    link?: string;
}

export interface WeeklyRule {
    type: 'week',
    day: WeekDay
}

export interface MonthlyRule {
    type: 'month',
    day: string
};

export interface YearlyRule {
    type: 'year',
    monthday: {
        month: number,
        day: number
    }
}

export interface Payment {
    date: Date;
    user_id: string;
    amount: number;
}

export interface FriendDebt {
    user_id: string;
    name: string;
    amount: number;
}

type WeekDay = 'Monday'| 'Tuesday'| 'Wednesday'| 'Thursday'| 'Friday'| 'Saturday'| 'Sunday';