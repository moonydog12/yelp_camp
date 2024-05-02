import BaseJoi from 'joi'
import sanitizeHTML from 'sanitize-html'

// 擴充 Joi 套件功能來防止 XSS 攻擊(HTML tag 過濾)
const extension = (joi) => ({
  type: 'string',
  base: BaseJoi.string(),
  messages: {
    'string.escapeHTML': '{{#label}} must not include HTML',
  },
  rules: {
    escapeHTML: {
      validate(value: string, helpers: any) {
        const clean = sanitizeHTML(value, {
          allowedTags: [],
          allowedAttributes: {},
        })

        if (clean !== value) {
          return helpers.error('string.escapeHTML', { value })
        }
        return clean
      },
    },
  },
})

const Joi = BaseJoi.extend(extension)

export const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    images: [
      {
        url: Joi.string(),
        filename: Joi.string(),
      },
    ],
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(),

  deleteImages: Joi.array(),
})

export const reviewSchema = Joi.object({
  review: Joi.object({
    rating: Joi.number().required().min(1).max(5),
    body: Joi.string().required().escapeHTML(),
  }).required(),
})
