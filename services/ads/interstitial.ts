import { AdEventType, InterstitialAd } from "react-native-google-mobile-ads";

// const adUnitId = "ca-app-pub-6519234150543133/7721921072";
const adUnitId = "ca-app-pub-3940256099942544/1033173712";

let interstitial = InterstitialAd.createForAdRequest(adUnitId);
let isLoaded = false;

export const loadInterstitial = () => {
  interstitial.load();

  interstitial.addAdEventListener(AdEventType.LOADED, () => {
    isLoaded = true;
  });

  interstitial.addAdEventListener(AdEventType.CLOSED, () => {
    isLoaded = false;
    interstitial.load();
  });
};

export const showInterstitial = () => {
  if (isLoaded) {
    interstitial.show();
  }
};
