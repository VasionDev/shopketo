export interface VIUser {
    referrer: string;
    promptLogin: string;
    viCode: string;
    guestPass: boolean;
    viProductId?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    createdTime: number;
    expiryTime: number | null
}