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

export const Sex = {
    MALE: "males",
    FEMALE: "females",
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

export const EventType = {
    CASUAL: "casual",
    TOURNAMENT: "tournament",
    DUPR: "dupr"
} as const;
export type EventType = (typeof EventType)[keyof typeof EventType];

export const EventButtonSituation = {
    NOT_MEMBER: "not_member",
    COMPLETE: "complete",
    JOINED: "joined",
    REQUESTED: "requested",
    MEMBER: "member"
} as const;
export type EventButtonSituation = (typeof EventButtonSituation)[keyof typeof EventButtonSituation];

export const LikeType = {
    LIKE: "like",
    MAD: "mad",
    LAUGH: "laugh",
    PICKLE: "pickle"
} as const;
export type LikeType = (typeof LikeType)[keyof typeof LikeType];

export type Locations = {
    id?: string | null;
    name?: string;
    latitude: number;
    longitude: number;
    address?: string;
}

export type Users = {
    id: string | null;
    username: string;
    email: string;
    profile_pic?: string | null;
    profile_pic_file?: File | null;
    profile_pic_path?: string | null;
    phone?: string | null;
    location?: Locations | null;
    description?: string | null;
};

export type UserHeader = {
    id: string;
    username: string;
    profile_pic: string;
    location?: Locations | null;
}

export type Club_Members_Basic = {
    user_id?: string;
    club_id: string;
    role: Role;
    is_favorite: boolean;
    level?: Level;
    is_level_approved: boolean;
}

export type Club_Members = Club_Members_Basic & {
    user: UserHeader;
}

export type Club_Requests = {
    user?: UserHeader;
    club_id: string
}

export type UserClubRequests = {
    id: string;
    user_id: string;
    club: Clubs;
}

export type Clubs = {
    id?: string | null;
    name: string;
    description?: string;
    level: Level;
    location?: Locations | null;
    location_id?: string | null;
    is_public: boolean;
    profile_pic?: string | null;
    profile_pic_path?: string | null;
    profile_pic_file?: File | null;
    banner?: string | null;
    banner_path?: string | null;
    banner_file?: File | null;
};

export type ClubHeader = {
    id: string | null;
    name: string;
    profile_pic?: string | null;
}

export type UserClubs = {
    role: Role;
    is_favorite: boolean;
    level?: Level;
    is_level_approved: boolean;
    club: Clubs;
}

export type Events = {
    id?: string | null;
    name: string;
    club_id?: string;
    club?: ClubHeader;
    start_time: string;
    end_time: string;
    location?: Locations | null;
    location_id?: string | null;
    price: number | null;
    description?: string | null;
    event_type: EventType;
    is_auto_approve: boolean;
    is_singles: boolean;
    sex: Sex;
    level: Level;
    max_players: number | null;
    recurring: Recurring;
    approve_window: number | null;
}

export type Players = {
    user: UserHeader | null;
    event_id: string;
    approved: boolean;
    approved_at: string;
    paid: boolean;
};

export type Hosts = {
    user: UserHeader | null;
    event_id: string;
}

export type EventPlayer = {
    event: Events;
    player: Players | null;
}

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