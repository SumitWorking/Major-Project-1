const express = require("express")
const router = express.Router();
const WrapAsync = require("../utility/WrapAsync.js");
const {listingSchema} = require("../schema.js")
const ExpressError = require("../utility/ExpressError.js");
const Listing = require("../models/listing.js");



const validateListing = (req,res,next) => {
    let { error } = listingSchema.validate(req.body);
    if(error) {
      let errMsg = error.details.map((el) => el.message).join(","); 
      throw new ExpressError(400, errMsg)
    } else {
      next();
    }
  }
  


//Index Route
router.get("/",WrapAsync( async (req, res,next) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
}));

//New Route
router.get("/new", (req, res) => {
  res.render("new.ejs"); 
});

//Show Route - Added .populate("reviews") so they actually show up
router.get("/:id", async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id).populate("reviews");
  res.render("show.ejs", { listing });
});

//Create Route
router.post("/",validateListing, WrapAsync( async (req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings"); 
  }));
  
  //Edit Route
  router.get("/:id/edit", async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("edit.ejs", { listing });
  });
  
  //Update Route
  router.put("/:id",validateListing,WrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${id}`);
  }));
  
  //Delete Route
  router.delete("/:id/", async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
  });

  module.exports = router