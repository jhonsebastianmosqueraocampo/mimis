import {
  RewardedAd,
  RewardedAdEventType,
} from "react-native-google-mobile-ads";

// const adUnitId = "ca-app-pub-6519234150543133/3046402796";
const adUnitId = "ca-app-pub-3940256099942544/5224354917";

let rewarded: RewardedAd | null = null;

export const loadRewardedAd = () => {
  rewarded = RewardedAd.createForAdRequest(adUnitId);

  rewarded.load();
};

export const showRewardedAd = (onReward: () => void) => {
  if (!rewarded) {
    loadRewardedAd();
  }

  if (!rewarded) return;

  const unsubscribeReward = rewarded.addAdEventListener(
    RewardedAdEventType.EARNED_REWARD,
    () => {
      onReward();
      unsubscribeReward();
      loadRewardedAd(); // precarga el siguiente
    },
  );

  rewarded.show();
};
