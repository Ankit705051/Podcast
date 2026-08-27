import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/AppError.js";
import { hassedPassword } from "../utils/password.js";
import { generateAccessToken, generateVerificationToken } from "../utils/token.js";
import type { RegisterUserInput } from "../validation/user.validation.js";
import "dotenv/config";

export const registerUser = async (data: RegisterUserInput) => {
  const { name, email, password, location, bio } = data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new AppError("User already exists", 400, "EMAIL_ALREADY_EXISTS");
    }

    const hashedPassword = await hassedPassword(password);
    const verificationToken = generateVerificationToken();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location: location || null,
        bio: bio || null,
        verificationToken,
      },
      select: {
        id: true,
        name: true,
        email: true,
        location: true,
        bio: true,
        verificationToken: true,
      },
    });

    const token = generateAccessToken(user.id);

    return {
      user,
      token,
      verificationToken: user.verificationToken,
    };
  } catch (error) {
    console.error("Registration error:", error);
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Registration failed due to database error", 500, "DATABASE_ERROR");
  }
};



export const initializeDefaultAdmin=async()=>{
  const adminEmail=process.env.ADMIN_EMAIL;
  const adminPassword=process.env.ADMIN_PASSWORD;
  if(!adminEmail || !adminPassword){
    console.error("Admin email or password not found in environment variables");
    return;
  }
  try{
    const existAdmin=await prisma.user.findUnique({
      where:{
        email:adminEmail
      }
    });
    if(existAdmin){
      console.log("Admin already exists");
      return{
        created:false,
      admin:existAdmin      }
    }
    const hashedPassword = await hassedPassword(adminPassword);
    const defaultAdmin=await prisma.user.create({
      data:{
        name:"JudgeX",
        email:adminEmail,
          password:hashedPassword,
          role:"admin",
          verified:true
        }
      });
      console.log("Default admin created:",defaultAdmin);
      return{
        created:true,
        admin:defaultAdmin
      }
    }catch(error){
      console.error("Error initializing admin:",error);
      throw error;
    }
  }

 export const createAdmin=async(data:RegisterUserInput)=>{
     const {name,email,password,location,bio}=data;
     try{
     if(email) {
      const query = await prisma.user.findUnique({
        where:{
          email
        }
      });
      if(query){
        throw new AppError("User already exists",400,"USER_EXISTS");
      }
     }
     const hashedPassword = await hassedPassword(password); 
     const admin = await prisma.user.create({
      data:{
        name,
        email,
        password: hashedPassword,
        location: location || null,
        bio: bio || null,
        role:"admin",
        verified:true
      }
     });
     return admin;

    }catch(error){
      console.error("Error creating admin:",error);
      throw error;
    }
  }