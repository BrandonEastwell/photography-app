export interface ExifData {
    Make?: string,
    Model?: string,
    LensModel?: string,
    FocalLength?: number,
    Flash?: "Yes" | "No",
    FNumber?: string,
    GPSLatitude?: number,
    GPSLongitude?: number,
    ISOSpeedRatings?: string,
    ShutterSpeedValue?: string,
    DateTimeOriginal?: string,
    ExifImageWidth?: string,
    ExifImageHeight?: string
}

export interface ExifDataErrors {
    Make?: string,
    Model?: string,
    LensModel?: string,
    FocalLength?: string,
    Flash?: "Yes" | "No",
    FNumber?: string,
    GPSLatitude?: string,
    GPSLongitude?: string,
    ISOSpeedRatings?: string,
    ShutterSpeedValue?: string,
}

export type TimePeriodValue = "today" | "this_week" | "this_month" | "this_year";

export interface Photo {
    ISO: number | null
    camera_make: string | null
    camera_model: string | null
    distance: number | null
    focal_length: number | null
    image_url: string
    lens: string | null
    relevance_score: number | null
    shutter_speed: string | null
    user_id: number
    votes: number
}