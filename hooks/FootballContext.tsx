import { useFetch } from "@/hooks/FetchContext";
import { FunFact, LiveMatch } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";

type FootballContextType = {
  facts: FunFact[];
  matchesToday: LiveMatch[];
  loadingFootball: boolean;
  refreshFootballData: () => Promise<void>;
};

const FootballContext = createContext<FootballContextType | undefined>(
  undefined,
);

const STORAGE_KEY = "footballDailyCache";
const CACHE_TIME = 24 * 60 * 60 * 1000;

export const FootballProvider = ({ children }: { children: ReactNode }) => {
  const { getFunFacts, getMatchesToday } = useFetch();

  const [facts, setFacts] = useState<FunFact[]>([]);
  const [matchesToday, setMatchesToday] = useState<LiveMatch[]>([]);
  const [loadingFootball, setLoadingFootball] = useState(true);

  // guardar cache
  const saveCache = async (facts: FunFact[], matches: LiveMatch[]) => {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          facts,
          matches,
          timestamp: Date.now(),
        }),
      );
    } catch (err) {
      console.log("cache save error", err);
    }
  };

  // leer cache
  const loadCache = async () => {
    try {
      const cache = await AsyncStorage.getItem(STORAGE_KEY);

      if (!cache) return false;

      const parsed = JSON.parse(cache);

      const now = Date.now();

      if (now - parsed.timestamp < CACHE_TIME) {
        setFacts(parsed.facts || []);
        setMatchesToday(parsed.matches || []);
        return true;
      }

      return false;
    } catch (err) {
      console.log("cache read error", err);
      return false;
    }
  };

  // fetch backend
  const fetchFootballData = async () => {
    try {
      const [factsRes, matchesRes] = await Promise.all([
        getFunFacts(1),
        getMatchesToday(),
      ]);

      const factsData = factsRes?.list || [];
      const matchesData = matchesRes?.matches || [];

      setFacts(factsData);
      setMatchesToday(matchesData);

      await saveCache(factsData, matchesData);
    } catch (err) {
      console.log("football fetch error", err);
    }
  };

  // refrescar manual
  const refreshFootballData = async () => {
    setLoadingFootball(true);
    await fetchFootballData();
    setLoadingFootball(false);
  };

  // init
  const init = async () => {
    setLoadingFootball(true);

    const hasCache = await loadCache();

    if (!hasCache) {
      await fetchFootballData();
    }

    setLoadingFootball(false);
  };

  useEffect(() => {
    init();
  }, []);

  return (
    <FootballContext.Provider
      value={{
        facts,
        matchesToday,
        loadingFootball,
        refreshFootballData,
      }}
    >
      {children}
    </FootballContext.Provider>
  );
};

export const useFootball = () => {
  const ctx = useContext(FootballContext);

  if (!ctx) {
    throw new Error("useFootball must be used inside FootballProvider");
  }

  return ctx;
};
