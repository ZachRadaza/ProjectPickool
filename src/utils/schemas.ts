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
    MIXED: "mixed",
    ANY: "any"
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
    OPENPLAY: "open play",
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

export const NotificationType = {
    CLUB_REQUEST: "club_request",
    CLUB_ACCEPTED: "club_accepted",
    CLUB_NEW_EVENT: "club_new_event",
    CLUB_LEVEL_APPROVED: "club_level_approved",
    CLUB_ADMIN: "club_admin",
    EVENT_HOST: "event_host",
    EVENT_REQUEST: "event_request",
    EVENT_ACCEPTED: 'event_accepted',
    EVENT_REMINDER: "event_reminder",
    POST_TAGGED: "post_tagged"
} as const;
export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType];

export const LikeType = {
    LIKE: "like",
    MAD: "mad",
    LAUGH: "laugh",
    PICKLE: "pickle"
} as const;
export type LikeType = (typeof LikeType)[keyof typeof LikeType];

export const SignUpMessageType = {
    NONE: "",
    SUCCESS: "Verification Email Sent.",
    SUCCESSNOVERIFICATION: "Account Successfully Created",
    EMAILUSED: "Email is already in use",
    USERNAMEUSED: "Username in already in use",
    EMPTY: "Please Enter All the Fields",
    USERNAMELENGTH: "Username must be 5-20 Characters",
    PASSWORDLENGTH: "Password must be atleast 5 Characters"
} as const;
export type SignUpMessageType = (typeof SignUpMessageType)[keyof typeof SignUpMessageType];

export type Locations = {
    id?: string | null;
    name?: string;
    latitude: number;
    longitude: number;
    address?: string;
};

export type Users = {
    id: string | null;
    username: string;
    email: string;
    profile_pic?: string | null;
    profile_pic_file?: File | null;
    profile_pic_path?: string | null;
    phone?: string | null;
    location?: Locations | null;
    location_id?: string;
    description?: string | null;
    created_at?: string;
};

export type UserHeader = {
    id: string;
    username: string;
    profile_pic: string;
    location?: Locations | null;
};

export type Club_Members_Basic = {
    user_id?: string;
    club_id: string;
    role: Role;
    is_favorite: boolean;
    level?: Level;
    is_level_approved: boolean;
};

export type Club_Members = Club_Members_Basic & {
    user: UserHeader;
    created_at: string;
};

export type Club_Requests = {
    user?: UserHeader;
    user_id?: string;
    club_id: string
    created_at?: string;
};

export type UserClubRequests = {
    user: UserHeader;
    club: Clubs;
    created_at?: string;
};

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
    created_at?: string;
};

export type ClubHeader = {
    id: string | null;
    name: string;
    profile_pic?: string | null;
    location?: Locations | null;
}

export type UserClubs = {
    role: Role;
    is_favorite: boolean;
    level?: Level;
    is_level_approved: boolean;
    club: Clubs;
    created_at: string;
};

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
    series_id?: string | null;
    current_players?: number | null;
};

export type EventHeader = {
    id: string | null;
    name: string;
    start_time: string;
    club?: ClubHeader;
    price: number;
    approve_window: number;
};

export type Players = {
    user: UserHeader | null;
    event_id: string;
    approved: boolean;
    approved_at: string;
    paid: boolean;
    created_at: string
};

export type Hosts = {
    user: UserHeader | null;
    event_id: string;
    created_at: string;
};

export type EventPlayer = {
    event: Events;
    player: Players | null;
};

export type Notifications = {
    id?: string;
    user_id: string;
    club_id?: string | null;
    club?: ClubHeader | null;
    event_id?: string | null;
    event?: EventHeader | null;
    notification_type: NotificationType;
    created_at: string;
};

export type Posts = {
    id?: string;
    club_id?: string;
    club?: ClubHeader;
    user_id?: string;
    user?: UserHeader;
    title: string;
    description: string;
    images?: Post_Images[];
    like_count?: number;
    liked_by_user?: boolean;
    comment_count?: number;
    comments?: Comments[][];
    hasMoreComments?: boolean;
    commentPage?: number;
    can_like?: boolean;
    post_tags?: Post_Tags[];
    created_at?: string;
};

export type Post_Images = {
    post_id?: string;
    image?: string;
    image_path?: string;
    image_file?: File;
    temp_id?: string;
}

export type Comments = {
    id?: string;
    post_id: string;
    comment: string;
    user?: UserHeader;
    user_id?: string;
    parent_comment_id: string | null;
    created_at?: string;
    parent_comment_user?: UserHeader | null;
    hasReplies?: boolean
    replyPage?: number
};

export type Likes = {
    post_id: string;
    user_id?: string;
    user?: UserHeader;
    type: LikeType;
    created_at: string;
};

export type Post_Tags = {
    post_id?: string;
    user_id: string;
    username?: string;
    id?: string;
    profile_pic?: string;
    created_at?: string;
}