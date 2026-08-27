
import bcrypt from "bcrypt";

export const hassedPassword=async (password:string):Promise<string>=>{
    const salt=await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export const comparePassword=async(
    password:string,
    hassedPassword:string
):Promise<boolean>=>{
    return await bcrypt.compare(password, hassedPassword);
}



