export interface EditFreelancerProps {
  userId: number;
  data: {
    bio?: string;
    location?: string;
    tagline?: string;
  };
}

export interface CreateSkillProps {
  userId: number;
  data: string[];
}
