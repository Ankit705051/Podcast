// import passport from "passport";
// import "dotenv/config";
// import { prisma } from "../lib/prisma.js";
// import { Strategy as GoogleStrategy } from "passport-google-oauth20";
// const clientId = process.env.GOOGLE_CLIENT_ID!;
// const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
// const callbackURL = process.env.GOOGLE_CALLBACK_URL!;

// passport.serializeUser((user: any, done) => {
//     done(null, user.id);
// });

// passport.deserializeUser(async (id: any, done) => {
//     try{
//         const user = await prisma.user.findUnique({where: {id}});
//         done(null, user);
//     }catch(error){
//         done(error, null);
//     }
// });


// passport.use(new GoogleStrategy({
//     clientID: clientId,
//     clientSecret: clientSecret,
//     callbackURL: callbackURL
// }, async (accessToken:string, refreshToken:string, profile: any, done: any) => {

//     try{
//         const googleId=profile.id;
//         const user = await prisma.user.findUnique({where: {googleId}});
//         if(user){
//             return done(null, user);
//         }
//         const newUser = await prisma.user.create({
//             data: {
//                 googleId: profile.id,
//                 email: profile.emails[0].value,
//                 name: profile.displayName
//             }
//         });
//         return done(null, newUser);
//     }catch(error){
//         return done(error, null);
//     }
// }));

// export default passport;