import { User } from "../models/user.js";
import { uploadCloudinary } from "../config/cloudinary.js";
import { geminiResponse } from "../gemini.js";
import moment from "moment";

// 🔹 Common response helper (IMPORTANT)
const sendResponse = (res, type, userInput, response, status = 200) => {
  return res.status(status).json({
    type,
    userInput,
    response,
  });
};

// 🔹 GET CURRENT USER
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) {
      return sendResponse(res, "general", null, "User not found", 404);
    }

    res.status(200).json(user);
  } catch (error) {
    return sendResponse(res, "general", null, "Current user error", 500);
  }
};

// 🔹 UPDATE USER
export const updateUser = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    let assistantImage = imageUrl || "";

    // Upload image if file exists
    if (req.file) {
      try {
        assistantImage = await uploadCloudinary(req.file.path);
      } catch (err) {
        console.log("Cloudinary upload failed:", err.message);
      }
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return sendResponse(res, "general", null, "User not found", 404);
    }

    return res.status(200).json(user);
  } catch (error) {
    return sendResponse(res, "general", null, error.message, 500);
  }
};

// 🔹 ASK TO GEMINI (MAIN API)
export const askToGemini = async (req, res) => {
  try {
    const { command } = req.body;

    if (!command) {
      return sendResponse(res, "general", null, "Command is required", 400);
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return sendResponse(res, "general", command, "User not found", 404);
    }

    // 🔥 Manage history (limit size)
    user.history = user.history || [];
    user.history.push(command);

    if (user.history.length > 20) {
      user.history.shift(); // keep last 20
    }

    await user.save();

    // 🔥 Call Gemini
    const result = await geminiResponse(
      command,
      user.assistantName,
      user.name
    );

    if (!result) {
      return sendResponse(
        res,
        "general",
        command,
        "Sorry, I could not connect to Gemini."
      );
    }

    console.log("Gemini Raw Response:", result);

    // 🔥 Safe JSON parsing
    let gemResult;

    try {
      const jsonMatch = result.match(/{[\s\S]*}/);

      if (!jsonMatch) throw new Error("Invalid JSON");

      gemResult = JSON.parse(jsonMatch[0]);
    } catch (err) {
      return sendResponse(res, "general", command, result);
    }

    const type = gemResult.type;

    // 🔥 Handle commands
    switch (type) {
      case "get-date":
        return sendResponse(
          res,
          type,
          command,
          `Current date is ${moment().format("YYYY-MM-DD")}`
        );

      case "get-time":
        return sendResponse(
          res,
          type,
          command,
          `Current time is ${moment().format("hh:mm A")}`
        );

      case "get-day":
        return sendResponse(
          res,
          type,
          command,
          `Today is ${moment().format("dddd")}`
        );

      case "get-month":
        return sendResponse(
          res,
          type,
          command,
          `Current month is ${moment().format("MMMM")}`
        );

      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "weather-show":
      case "general":
        return sendResponse(
          res,
          type,
          command,
          gemResult.response || "No response"
        );

      // 🔥 Default fallback (VERY IMPORTANT)
      default:
        return sendResponse(
          res,
          "general",
          command,
          gemResult.response || "I didn't understand that"
        );
    }
  } catch (error) {
    console.error("Ask Gemini Error:", error);

    return sendResponse(
      res,
      "general",
      null,
      "Something went wrong",
      500
    );
  }
};