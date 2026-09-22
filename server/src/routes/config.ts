import { Router } from "express";
import { env } from "../config/env";

export const configRouter = Router();

/**
 * Client-safe config: ad unit ids and placement rules (Section 15). No
 * secrets here - this is what makes the ad provider swappable from the
 * client side without a build.
 */
configRouter.get("/ads", (_req, res) => {
  res.json({
    provider: env.adsProvider,
    appIdIos: env.admobAppIdIos || "ca-app-pub-3940256099942544~1458002511", // Google's public test app id fallback
    appIdAndroid: env.admobAppIdAndroid || "ca-app-pub-3940256099942544~3347511713",
    testMode: !env.admobAppIdIos && !env.admobAppIdAndroid,
    placements: {
      bannerScreens: ["recipes_list", "tasks_list", "grocery_list"],
      interstitialAfter: ["chat_to_home_transition", "recipe_saved"],
      neverDuring: ["active_chat_exchange"],
      rewardedUnlocks: ["extra_recipe_generation", "extra_chat_message"],
    },
  });
});
