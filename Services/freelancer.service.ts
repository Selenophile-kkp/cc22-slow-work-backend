import { prisma } from "@/lib/prisma";
import type {
  CreateSkillProps,
  EditFreelancerProps,
} from "@/types/freelancer.types";

export const GetFreelancerService = async ({ id }: { id: number }) => {
  try {
    const profile = await prisma.freelancer_profile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            name: true,
            avatar_url: true,
            joined_at: true,
          },
        },
        freelancerSkills: true,
        services: {
          where: { status: "ACTIVE" },
        },
      },
    });

    if (!profile) return null;

    return profile;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const EditFreelancerService = async ({
  userId,
  data,
}: EditFreelancerProps) => {
  try {
    const freelancer = await prisma.freelancer_profile.upsert({
      where: {
        user_id: userId,
      },
      update: {
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.tagline !== undefined && { tagline: data.tagline }),
      },
      create: {
        user_id: userId,
        ...(data.bio !== undefined && { bio: data.bio }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.tagline !== undefined && { tagline: data.tagline }),
      },
    });

    if (!freelancer) return null;

    return freelancer;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const CreateSkillsService = async ({
  userId,
  data,
}: CreateSkillProps) => {
  try {
    const profile = await prisma.freelancer_profile.findUnique({
      where: {
        user_id: userId,
      },
    });

    if (!profile) return null;

    const skill = await prisma.freelancer_skill.createMany({
      data: data.map((skill) => ({
        freelancer_profile_id: profile.id,
        skill,
      })),
      skipDuplicates: true,
    });

    if (!skill) return null;

    return skill;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const DeleteSkillService = async ({ skillId }: { skillId: number }) => {
  try {
    const deleteSkill = await prisma.freelancer_skill.delete({
      where: {
        id: skillId,
      },
    });

    if (!deleteSkill) return null;

    return deleteSkill;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const GetFreelancerByNameService = async (name: string) => {
  try {
    const profile = await prisma.freelancer_profile.findFirst({
      where: {
        user: {
          name: {
            equals: name,
          },
        },
      },
      include: {
        user: {
          select: {
            name: true,
            avatar_url: true,
            joined_at: true,
          },
        },
        freelancerSkills: true,
        services: {
          where: { status: "ACTIVE" },
          include: {
            category: {
              select: { name: true, slug: true },
            },
          },
        },
      },
    });

    return profile;
  } catch (error) {
    console.error(error);
    return null;
  }
};
