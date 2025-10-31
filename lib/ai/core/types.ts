export interface ReviewData {
  rating: 1 | 2 | 3 | 4 | 5;
  name: string;
  text?: string;
  date?: Date | { toDate: () => Date };
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
