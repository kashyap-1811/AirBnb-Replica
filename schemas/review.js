const Joi = require('joi');

const reviewJoiSchema = Joi.object({
  review: Joi.object({
    comment: Joi.string().required().messages({
      'string.empty': 'Comment is required.',
    }),
    rating: Joi.number().min(1).max(5).required().messages({
      'number.base': 'Rating must be a number.',
      'number.min': 'Rating must be at least 1.',
      'number.max': 'Rating cannot be more than 5.',
    }),
  }).required()
});

module.exports = { reviewJoiSchema };