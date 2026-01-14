const Listing = require("../models/listing");

// Display all listings
module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("index.ejs", { allListings });
};

// Render form to create new listing
module.exports.renderNewForm = (req, res) => {
    res.render("new.ejs");
};

// Show specific listing details
module.exports.showListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id)
      .populate({
        path: "reviews",
        populate: { path: "author" }
      })
      .populate("owner");
    
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }
    res.render("show.ejs", { listing });
};

// Save new listing to Database with Geocoding
module.exports.createListing = async (req, res) => {
  let url =  req.file.path;
  let filename = req.file.filename;

  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id; 
  newListing.image = {url, filename};

  // --- FREE GEOCODING LOGIC ---
  try {
    let location = req.body.listing.location;
    let response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    let data = await response.json();

    if (data && data.length > 0) {
      // Nominatim returns [lat, lon], we save as [lon, lat] for GeoJSON standard
      newListing.geometry = {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
      };
    } else {
      // Default to [0,0] if location is not found to prevent crashes
      newListing.geometry = { type: "Point", coordinates: [0, 0] };
    }
  } catch (err) {
    console.error("Geocoding Error:", err);
    newListing.geometry = { type: "Point", coordinates: [0, 0] };
  }
  // ----------------------------

  await newListing.save();
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

// Render edit form
module.exports.editListing = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      req.flash("error", "Listing you requested for does not exist");
      return res.redirect("/listings");
    }
    let originalImageUrl = listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload","/upload/h_300,w_250")
    res.render("edit.ejs", { listing, originalImageUrl });
};

// Update existing listing with Geocoding
module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  
  // Update text fields first
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // --- UPDATE COORDINATES IF LOCATION CHANGED ---
  try {
    let location = req.body.listing.location;
    let response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
    );
    let data = await response.json();

    if (data && data.length > 0) {
      listing.geometry = {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
      };
    }
  } catch (err) {
    console.error("Geocoding Update Error:", err);
  }
  // ----------------------------------------------

  if (typeof req.file !== "undefined") {
    let url =  req.file.path;
    let filename = req.file.filename;
    listing.image = {url, filename};
  }

  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted!");
    res.redirect("/listings");
};
