import { v2 as cloudinary } from "cloudinary"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "Root",
  api_key: process.env.CLOUDINARY_API_KEY || "176174287718128",
  api_secret: process.env.CLOUDINARY_API_SECRET || "OpHz4GN3QZ04HheEL8dRpzcLLXk",
  secure: true,
})

export async function POST(req) 
{
  try
  {
    const { publicId } = await req.json()
    const result = await cloudinary.uploader.destroy(publicId)
    return Response.json(result)
  } 
  catch (err) 
  {
    return Response.json({ error: err.message }, { status: 500 })
  }
}