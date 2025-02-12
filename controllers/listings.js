//model,view,controller (MVC model/framework)

const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested for dees not exist!");
    res.redirect("/listings");
  }
  //console.log(listing);
  res.render("listings/show.ejs", { listing });
};

module.exports.createListing = async (req, res, next) => {
  //let { title, description, image, price, location, county } = req.body;
  // let listing = new Listing({
  //   title: title,
  //   description: description,
  //   image: image,
  //   price: price,
  //   location: location,
  //   country: county,
  // });
  //try {
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "send valid data for listing");
  // }

  //by using joi package to validate error in db-----------------------------

  // let result = listingSchema.validate(req.body);
  // console.log(result);
  // if (result.error) {
  //   throw new ExpressError(400, result.error);
  // }
  let url = req.file.path;
  let filename = req.file.filename;
  let newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  //let user don't enter description then check before adding the databse
  // if (!newListing.description) {
  //   throw new ExpressError(400, "description is missing");
  // }
  // if (!newListing.title) {
  //   throw new ExpressError(400, "title is missing");
  // }
  // if (!newListing.location) {
  //   throw new ExpressError(400, "location is missing");
  // }

  await newListing.save();
  //add flash
  req.flash("success", "new listing created!");
  res.redirect("/listings");
  //} catch (error) {
  //next(error);
  //}
};

module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for dees not exist!");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "send valid data for listing");
  // }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }
  req.flash("success", "listing updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  let delList = await Listing.findByIdAndDelete(id);
  //console.log(delList);
  req.flash("success", " listing Deleted!");
  res.redirect("/listings");
};
