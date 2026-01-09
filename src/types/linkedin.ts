export interface LinkedInProfile {
  name: string;
  headline: string;
  about: string;
  profilePicture?: string;
  linkedinUrl?: string;
  experience: string[];
  education: string[];
  skills: string[];
}

export interface RoastRequest {
  profile?: LinkedInProfile;
  bioText?: string;
}

export interface RoastResponse {
  roast: string;
  name?: string;
}
