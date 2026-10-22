import mongoose from "mongoose";

/**
 * Middleware to validate that a route :id param is a valid MongoDB ObjectId.
 * Returns 400 if invalid, preventing CastError noise in controllers.
 *
 * Usage: router.get("/:id", validateObjectId, controller)
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;

  if (id && !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format.",
    });
  }

  next();
};

export default validateObjectId;
