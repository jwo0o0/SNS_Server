const Feeds = require("../models/feeds");

exports.postFeed = async (req, res, next) => {
  try {
    console.log("user", req.user);
    const userId = req.user.id;
    const { content, pollContent, polls } = req.body;
    console.log(content, pollContent, polls);

    const newFeed = await Feeds.create({
      userId,
      content,
      pollContent,
      polls,
      pollCount: polls.length,
    });

    return res.status(201).json({
      message: "FEED_POST_SUCCESS",
      feedId: newFeed.id,
    });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};

exports.uploadFeedImages = async (req, res, next) => {
  try {
    const { feedId } = req.query;
    const feed = await Feeds.findByPk(feedId);
    feed.images = req.uploadedImages;
    await feed.save();
    return res.status(200).json({ message: "FEED_IMAGE_UPLOAD_SUCCESS" });
  } catch (error) {
    console.error(error);
    return next(error);
  }
};
