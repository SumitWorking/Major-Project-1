const express = require("express")
const router = express.Router({mergeParams: true});
const WrapAsync = require("../utility/WrapAsync.js");
const ExpressError = require("../utility/ExpressError.js");
const {reviewSchema } = require("../schema.js")
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const { isLoggedIn, isReviewAuthor,validateReview } = require("../middleware.js");

const reviewController = require("../contollers/reviews.js");

//Post Review Route
router.post("/",isLoggedIn, validateReview, WrapAsync(reviewController.createReview));
  
  
  router.delete("/:reviewId",isLoggedIn,isReviewAuthor, WrapAsync(reviewController.destroyReview))


  module.exports = router;
