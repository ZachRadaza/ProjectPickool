export const Role = {
    ADMIN: "admin",
    MEMBER: "member",
    OWNER: "owner"
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const Level = {
    UNSET: "unset",
    BEGINNER: "beginner",
    INTERMEDIATE: "intermediate",
    ADVANCED: "advanced",
    ALL: "all levels"
} as const;

export type Level = (typeof Level)[keyof typeof Level];

export const RequestStatus = {
    WAITING: "waiting",
    APPROVED: "approved",
    DENIED: "denied"
} as const;

export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export const Sex = {
    MALE: "males",
    FEMALE: "female",
    MIXED: "mixed"
} as const;

export type Sex = (typeof Sex)[keyof typeof Sex];

export const Recurring = {
    NONE: "none",
    DAILY: "daily",
    WEEKLY: "weekly",
    BIWEEKLY: "biweekly",
    MONTLY: "monthly"
} as const;

export type Recurring = (typeof Recurring)[keyof typeof Recurring];

export const LikeType = {
    LIKE: "like",
    MAD: "mad",
    LAUGH: "laugh",
    PICKLE: "pickle"
} as const;

export type LikeType = (typeof LikeType)[keyof typeof LikeType];

export type Locations = {
    id?: string | null;
    name: string;
    latitude: number;
    longitude: number;
    location_id: number;
}

export type Users = {
    id: string;
    username: string;
    email: string;
    profile_pic?: string | null;
    profile_pic_path: string | null;
    phone?: string | null;
    location?: Location | null;
    location_id?: string | null;
    description?: string | null;
};

export type UserHeader = {
    id: string;
    username: string;
    profile_pic: string;
}

export type Clubs = {
    id?: string | null;
    name: string;
    description?: string;
    level: string;
    location?: Location | null;
    location_id?: string | null;
    is_public: boolean;
    profile_pic?: string | null;
    profile_pic_path?: string | null;
    profile_pic_file?: string | null;
    banner?: string | null;
    banner_path?: string | null;
    banner_file?: string | null;
};

export type Club_Members = UserHeader & {
    club_id: string;
    role: Role;
    is_favorite: boolean;
    level?: Level;
    is_level_approved: boolean;
}

export type Club_Requests = UserHeader & {
    club_id: string
    status: RequestStatus;
}

export type Events = {
    id: string;
    club_id: string;
    date: Date;
    location: Location;
    price: number;
    description: string;
    banner: string;
    is_auto_approved: string;
    is_public: string;
    is_dupr: boolean;
    is_singles: boolean;
    sex: Sex;
    level: string;
    max_players: number;
    recurring: Recurring;
}

export type Players = Club_Members & {
    event_id: string;
    position: number;
};

export type Posts = {
    id: string;
    club_id: string;
    user_id: string;
    title: string;
    description: string;
    images: string[];
    likes: Likes[];
    numComments: number;
}

export type Comment = {
    id: string;
    post_id: Posts;
    comment: string;
    user: Users;
}

export type Likes = {
    post_id: string;
    user_id: string;
    type: LikeType;
}