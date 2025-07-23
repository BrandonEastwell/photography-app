export interface ExifData {
    Make?: string,
    Model?: string,
    LensModel?: string,
    FocalLength?: number,
    Flash?: boolean,
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
    Flash?: string,
    FNumber?: string,
    GPSLatitude?: string,
    GPSLongitude?: string,
    ISOSpeedRatings?: string,
    ShutterSpeedValue?: string,
}

export type TimePeriodValue = "today" | "this_week" | "this_month" | "this_year";
