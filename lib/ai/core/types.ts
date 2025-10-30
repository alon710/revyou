export interface ReviewData {
  rating: number;
  reviewerName: string;
  reviewText: string;
  reviewDate?: Date | { toDate: () => Date };
}

export interface StarConfig {
  customInstructions: string;
  autoReply: boolean;
}

export interface LocationConfigData {
  locationName?: string;
  locationDescription: string;
  locationPhone?: string;
  toneOfVoice: string;
  languageMode: string;
  maxSentences?: number;
  allowedEmojis?: string[];
  signature?: string;
  starConfigs: {
    [key: number]: StarConfig;
  };
}
