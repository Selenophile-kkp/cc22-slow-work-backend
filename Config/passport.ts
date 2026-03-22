import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { prisma } from "@/lib/prisma";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, RefreshTokenController, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error("No email returned from Google"), undefined);
        }

        const existingOAuth = await prisma.oauth_account.findFirst({
          where: {
            provider: "google",
            provider_id: profile.id,
          },
          include: { user: true },
        });

        if (existingOAuth) {
          return done(null, existingOAuth.user);
        }

        let user = await prisma.user.findFirst({ where: { email } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.displayName,
              avatar_url: avatar ?? null,
            },
          });
        }

        await prisma.oauth_account.create({
          data: {
            user_id: user.id,
            provider: "google",
            provider_id: profile.id,
          },
        });

        return done(null, user);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
  )
);

export default passport;
