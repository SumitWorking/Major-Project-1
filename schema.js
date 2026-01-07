const Joi = require('joi');

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
        location: Joi.string().required(),
        country: Joi.string().required(),
        // Fixed: Price should be a number, not a string
        price: Joi.number().required().min(0),
        
        // FIXED: Changed from .string() to .object()
        // This matches your Mongoose Schema: image { filename, url }
        image: Joi.object({
            url: Joi.string().allow("", null),
            filename: Joi.string().allow("", null)
        }).allow("", null) 
    }).required(),
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required(),
    }).required(),
});