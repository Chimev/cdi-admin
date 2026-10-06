import { connectToDB } from "@/utilis/connectToDb";
import User from "@/utilis/models/User";
import { NextRequest, NextResponse } from "next/server";



interface RouteParams {
    params: Promise<{id: string}>
}


export async function GET(req: NextRequest, {params}: RouteParams){
    console.log('params', params)
     const {id} = await params;
    try {
       await connectToDB()

        if(!id){
            return NextResponse.json({message: 'User ID is required'}, {status: 400})
        }
       const user = await User.findOne({_id: id}).select('firstName lastName email')

       if(!user){
        return NextResponse.json({message: 'User not found'}, {status: 404})
       }

       return NextResponse.json({data: user}, {status: 200})
    } catch (error) {
        return NextResponse.json({message: 'Internal Server Error'}, {status: 500})
    }



}