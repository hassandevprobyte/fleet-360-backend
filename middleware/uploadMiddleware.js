const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const Boom = require("@hapi/boom");

const MIME_GROUPS = {
  IMAGES: ["image/jpeg", "image/png", "image/webp"],
  VIDEOS: ["video/mp4", "video/quicktime", "video/webm", "video/3gpp"], // quicktime = iPhone .mov
  DOCUMENTS: ["application/pdf", "text/csv"],
};

/**
 * @param {Object} options
 * @param {string|function} options.destination - folder path string or function(req, file) => path
 * @param {"single"|"array"|"fields"} options.uploadType - type of upload
 * @param {string|Array} options.field - field name or array of field configs (for "fields")
 * @param {Array<string>} options.allowedMimeTypes - allowed MIME types
 * @param {number} options.maxFileSize - max file size in bytes
 */
const uploadMiddleware = ({
  destination,
  uploadType = "single",
  field,
  allowedMimeTypes = [...MIME_GROUPS.IMAGES, ...MIME_GROUPS.DOCUMENTS, ...MIME_GROUPS.VIDEOS],
  maxFileSize = 5 * 1024 * 1024,
}) => {
  if (!destination) throw Boom.badImplementation("Upload destination is required");

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        let uploadPath = typeof destination === "function" ? destination(req, file) : destination;

        fs.mkdirSync(uploadPath, { recursive: true });

        cb(null, uploadPath);
      } catch (err) {
        cb(Boom.internal("Failed to create upload directory"));
      }
    },
    filename: (req, file, cb) => {
      try {
        const uniqueSuffix = crypto.randomBytes(8).toString("hex");
        const filename = `${uniqueSuffix}${path.extname(file.originalname)}`;
        cb(null, filename);
      } catch (err) {
        cb(Boom.internal("Failed to generate file name"));
      }
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(Boom.badRequest(`Invalid file type: ${file.mimetype}`), false);
    }
    cb(null, true);
  };

  const upload = multer({ storage, fileFilter, limits: { fileSize: maxFileSize } });

  switch (uploadType) {
    case "array":
      if (!field) throw Boom.badImplementation("Field name required for array upload");

      return upload.array(field);

    case "fields":
      if (!Array.isArray(field)) throw Boom.badImplementation("Field array required for fields upload");

      return upload.fields(field);

    case "single":
    default:
      if (!field) throw Boom.badImplementation("Field name required for single upload");

      return upload.single(field);
  }
};

module.exports = uploadMiddleware;
