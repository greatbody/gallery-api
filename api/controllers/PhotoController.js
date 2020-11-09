/**
 * PhotoController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See https://sailsjs.com/docs/concepts/actions
 */

const SkipperDisk = require("skipper-disk");
const mime = require('mime-types');

module.exports = {
  /**
   * Upload photo
   *
   * (POST /photos/upload)
   */
  upload: function (req, res) {
    req.file("photo").upload(
      {
        // don't allow the total upload size to exceed ~10MB
        maxBytes: 10000000,
      },
      function whenDone(err, uploadedFiles) {
        if (err) {
          return res.serverError(err);
        }

        // If no files were uploaded, respond with an error.
        if (uploadedFiles.length === 0) {
          return res.badRequest("No file was uploaded");
        }

        // Save the "fd" and the url where the photo for a user can be accessed
        Photo.create({
          name: uploadedFiles[0].filename,
          path: uploadedFiles[0].fd,
        }).exec(function (errCreate) {
          if (errCreate) return res.serverError(errCreate);
          return res.json({
            success: true,
          });
        });
      }
    );
  },

  index: async function (req, res) {
    const photos = await Photo.find();
    return res.json(photos);
  },

  view: async function (req, res) {
    const photo = await Photo.findOne(req.param("id"));
    const fileAdapter = SkipperDisk(/* optional opts */);
    // set the filename to the same file as the user uploaded
    res.type(mime.lookup(photo.path));
    // Stream the file down
    fileAdapter
      .read(photo.path)
      .on("error", function (err) {
        return res.serverError(err);
      })
      .pipe(res);
  },
};
