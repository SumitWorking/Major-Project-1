const express = require("express");
const router = express.Router();
const WrapAsync = require("../utility/WrapAsync.js"); 
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js"); 
const multer  = require('multer')
const { storage } = require('../cloudConfig.js');
const upload = multer({storage})


const listingControllers = require("../contollers/listing.js")

router.route("/")
    .get(WrapAsync(listingControllers.index))
    .post(
        isLoggedIn, 
        upload.single("listing[image]"),
        validateListing, 
        // 2. FIXED: Changed listingController to listingControllers
        WrapAsync(listingControllers.createListing) 
    );
    // .post(upload.single('listing[image]'), (req, res) => {
    //     res.send(req.file);
    // });

router.get("/new", isLoggedIn, listingControllers.renderNewForm);


router.route("/:id")
    .get(WrapAsync(listingControllers.showListing))
    .put(
        isLoggedIn, 
        isOwner,
        upload.single("listing[image]"),
        validateListing, 
        WrapAsync(listingControllers.updateListing)
    )
    .delete(
        isLoggedIn, 
        isOwner, 
        WrapAsync(listingControllers.destroyListing)
    );

router.get(
    "/:id/edit", 
    isLoggedIn, 
    isOwner, 
    WrapAsync(listingControllers.editListing)
);

module.exports = router;