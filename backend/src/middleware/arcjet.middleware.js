import aj from "../lib/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

export const arcJetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);
    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Too many requests. Please try again later." });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Bot access denied." });
      } else {
        return res.status(403).json({ message: "Access denied." });
      }
    }

    if(isSpoofedBot(req)){
        return res.status(403).json({ message: "Spoofed Bot access denied." });
    }
    next();
  } catch (err) {
    console.error("Arcjet middleware error:", err);
    next();
  }
};
