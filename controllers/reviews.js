const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
  //console.log(req.params.id);
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);
  newReview.author = req.user._id;
  //console.log(newReview);

  listing.reviews.push(newReview);

  await newReview.save();
  req.flash("success", "new review created!");
  await listing.save();

  res.redirect(`/listings/${listing._id}`);
  // console.log("new review saved");
  // res.send("review submited");
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewId } = req.params;
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "review Deleted!");
  res.redirect(`/listings/${id}`);
};
