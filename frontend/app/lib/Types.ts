export interface ExifData {
    Make?: string
    Model?: string
    LensModel?: string
    FocalLength?: number
    Flash?: "Yes" | "No"
    FNumber?: string
    GPSLatitude?: number
    GPSLongitude?: number
    ISOSpeedRatings?: number
    ShutterSpeedValue?: string
}

export type TimePeriodValue = "today" | "this_week" | "this_month" | "this_year";

export interface Photo {
    ISO?: number
    camera_make?: string
    camera_model?: string
    distance?: number
    focal_length?: number
    latitude?: number
    longitude?: number
    f_stop?: number
    image_url: string
    lens?: string
    flash?: boolean
    relevance_score?: number
    shutter_speed?: number
    user_id: number
    votes?: number
}

export const photoKeyToExifKeyMap: {
    [K in keyof Photo]?: keyof ExifData;
} = {
    ISO: "ISOSpeedRatings",
    camera_make: "Make",
    camera_model: "Model",
    lens: "LensModel",
    focal_length: "FocalLength",
    shutter_speed: "ShutterSpeedValue",
    flash: "Flash",
    latitude: "GPSLatitude",
    longitude: "GPSLongitude",
    f_stop: "FNumber"
};

export interface UserProfile {
    user_id: number
    username: string
    first_name: string
    last_name: string
    description: string | null
    image: string | null
}