import { User } from "../models/user.js";
import { uploadCloudinary } from "../config/cloudinary.js";
import { geminiResponse } from "../gemini.js";
import moment from "moment";
import { json, response } from "express";

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Current user error" });
  }
};

export const updateUser = async (req, res) => {
  try {
    console.log(req.body, "body");
    console.log(req.file, "file");

    const { assistantName, imageUrl } = req.body;

    let assistantImage = "";
    if (req.file) {
      assistantImage = await uploadCloudinary(req.file.path);
    } else {
      assistantImage = imageUrl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantImage, assistantName },
      { new: true }
    ).select("-password");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const askToGemini = async (req, res) => {

  try {
    const { command} = req.body;
    
   
    console.log("Assistant API called with command:", command);
    const user = await User.findById(req.userId);

    if (!user.history) user.history = [];
    user.history.push(command)
    await user.save()

    const userName = user.name;

    const assistantName = user.assistantName;

    const result = await geminiResponse(command, assistantName, userName);

    if (!result) {
      return res.json({type:"general",userInput:command,
        response: "Sorry, I could not connect to Gemini."
      });
    }
    
    console.log("Gemini Raw Response:", result);
    const jsonMatch = result.match(/{[\s\S]*}/);
    if (!jsonMatch) {
      return res.status(400).json({ message: "sorry i can't understand" });
    }

    const gemResult = JSON.parse(jsonMatch[0]);
    const type = gemResult.type;

    switch (type) {
      case "get-date":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current date is ${moment().format("YYYY-DD-MM")}`,
        });
    
      case "get-time":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current time is ${moment().format("hh:mm A")}`,
        });
    
      case "get-day":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Today is ${moment().format("dddd")}`,
        });
    
      case "get-month":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: `Current month is ${moment().format("MMMM")}`,
        });
    
      case "google-search":
      case "youtube-search":
      case "youtube-play":
      case "calculator-open":
      case "instagram-open":
      case "facebook-open":
      case "general":
      case "weather-show":
        return res.json({
          type,
          userInput: gemResult.userInput,
          response: gemResult.response,
        });
    }
  } catch (error) {
    res.status(500).json({ response: "Ask assistant error" });
  }
};
