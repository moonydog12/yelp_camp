import cloudinary from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import dotenv from 'dotenv'

dotenv.config()
const cloudinaryConfig = cloudinary.v2

cloudinaryConfig.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
})

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryConfig,
  params: () => ({
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'jpg', 'png'],
  }),
})

export { cloudinaryConfig, storage }
