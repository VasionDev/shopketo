export interface InvitationSuccessRes {
  pendingContacts: {
    name: string;
    avatar: string | null;
    email: string;
    expiresAt: string;
    abrv?: any;
    availability?: boolean;
  }[];
  pendingInvitesCount: number;
  readonly registeredFriends: {
    name: string;
    avatar: string | null;
    abrv?: any;
  }[];
  readonly registeredFriendsCount: number;
}

export interface BonusGatewayInvitationResponse {
  readonly isSuccess: boolean;
  readonly error: any;
  readonly result: InvitationSuccessRes | null;
}
