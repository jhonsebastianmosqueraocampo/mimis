import {
  Bet,
  BetInfo,
  Coach,
  CoachStats,
  Competitions,
  Country,
  CupStanding,
  Favorites,
  Fixture,
  GroupStanding,
  LeagueB,
  Lineup,
  LiveMatch,
  NationalLeague,
  NewsItem,
  NewsPayload,
  OneByOne,
  PlayerB,
  PlayerCareer,
  PlayerFixtureStats,
  Prediction,
  PredictionOddsItem,
  PreMatchStats,
  SelectionBet,
  setBet,
  StatsByCategory,
  swiperItem,
  SyntheticMatch,
  Team,
  TeamPlayerStatsByLeague,
  TeamStanding,
  TeamSummary,
  User,
  VideoYoutube,
  WeeklyGoalVideo,
  WeeklyWorldTopVideo,
} from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, ReactNode, useContext } from "react";

// const apiUrl = Constants.expoConfig?.extra?.API_URL;
const apiUrl = "http://192.168.20.17:3001/api";

type FetchContextType = {
  getCountries: (isRetry?: boolean) => Promise<{
    success: boolean;
    data: Country[];
    message?: string;
  }>;
  getLeagueFromCountry: (
    country: string,
    isRetry?: boolean
  ) => Promise<{ success: boolean; data: LeagueB[]; message?: string }>;
  getTeamsFromLeague: (
    leagueId: number,
    isRetry?: boolean
  ) => Promise<{ success: boolean; data: Team[]; message?: string }>;
  getPlayerFromTeam: (
    teamId: string,
    isRetry?: boolean
  ) => Promise<{ success: boolean; data: PlayerB[]; message?: string }>;
  getCoachesFromLeague: (
    leagueId: number,
    isRetry?: boolean
  ) => Promise<{ success: boolean; data: Coach[]; message?: string }>;
  saveFavorites: (
    favoritesList: Favorites,
    isRetry?: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  getFavorites: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    teams: swiperItem[];
    players: swiperItem[];
    leagues: swiperItem[];
    coaches: swiperItem[];
  }>;
  registerNotificationToken: (
    notificationToken: string,
    isRetry?: boolean
  ) => Promise<{ success: boolean; message?: string }>;
  getTeam: (
    id: string,
    isRetry?: boolean
  ) => Promise<{ success: boolean; message?: string; team: Team }>;
  getNewsTeam: (
    team: string,
    isRetry?: boolean
  ) => Promise<{ success: boolean; message?: string; news: swiperItem[] }>;
  getNextTeamMatch: (
    teamId: string,
    isRetry?: boolean
  ) => Promise<{ success: boolean; message?: string; fixture: Fixture | null }>;
  getPreviousAndPostTeamMatches: (
    teamId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    pastFixtures: Fixture[];
    upcomingFixtures: Fixture[];
  }>;
  getLeaguesByTeam: (
    teamId: string,
    season: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    competitions: Competitions[];
  }>;
  getStangingsLeague: (
    leagueId: string,
    season: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    standings: TeamStanding[];
    matches: LiveMatch[];
  }>;
  getStangingsCup: (
    leagueId: string,
    season: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    hasGroupPhase: boolean;
    groupPhase: GroupStanding[];
    knockoutPhase: CupStanding[];
    matches: LiveMatch[];
  }>;
  getFriendlyMatches: (
    teamId: string,
    season: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    fixtures: Fixture[];
  }>;
  getPlayersStatsByTeam: (
    teamId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    stats: TeamPlayerStatsByLeague[];
  }>;
  getSquadByTeam: (
    teamId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    squad: TeamPlayerStatsByLeague | null;
  }>;
  getCoachByTeam: (
    teamId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    coach: Coach | null;
  }>;
  getNewsSignAndRumorTeam: (
    teamId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    newSigns: swiperItem[];
    newRumor: swiperItem[];
  }>;
  getNewsSignAndRumorFavoritesAndGeneral: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    newsFavorites: swiperItem[];
    newsGeneral: swiperItem[];
  }>;
  getInfoPlayer: (
    playerId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    player: PlayerB | null;
  }>;
  getPlayerNews: (
    playerId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    news: swiperItem[];
  }>;
  getPlayerSeasons: (
    playerId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    seasons: number[];
  }>;
  getPlayerCareer: (
    playerId: string,
    season: number,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    playerCareer: PlayerCareer | null;
  }>;
  getLeague: (
    leagueId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    league: LeagueB | null;
  }>;
  getLeagueNews: (
    leagueId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    news: swiperItem[];
  }>;
  getPreviousAndPostLeagueMatches: (
    leagueId: string,
    season: number,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    pastFixtures: Fixture[];
    upcomingFixtures: Fixture[];
  }>;
  getLeagueStats: (
    leagueId: string,
    season: number,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    stats: StatsByCategory | null;
  }>;
  getCoachInfo: (
    coachId: string,
    season: number,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    coach: CoachStats | null;
  }>;
  getCoachNews: (
    coachId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    news: swiperItem[];
  }>;
  getFixture: (
    fixtureId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    fixture: Fixture | null;
  }>;
  getVideoFromYoutube: (
    query: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }>;
  getVideoTeamFromYoutube: (
    team: string,
    query: string,
    season?: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }>;
  getVideoMatchFromYoutube: (
    teamA: string,
    teamB: string,
    query: string,
    season?: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }>;
  getVideoPlayerFromYoutube: (
    player: string,
    query: string,
    season?: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }>;
  getFavoritesVideos: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    videosTeams: VideoYoutube[];
    videosPlayers: VideoYoutube[];
  }>;
  getFixturePrediction: (
    fixtureId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    prediction: Prediction | null;
  }>;
  getFeaturedPlayerByTeamLeague: (
    fixtureId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    playerFixtureStatsHome: PlayerFixtureStats | null;
    playerFixtureStatsAway: PlayerFixtureStats | null;
  }>;
  getPreMatchStats: (
    fixtureId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    stats: PreMatchStats | null;
  }>;
  getLineUp: (
    fixtureId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    lineup: Lineup | null;
  }>;
  getLiveMatch: (
    fixtureId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    live: LiveMatch | null;
  }>;
  getPredictionOdds: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    predictionOdds: PredictionOddsItem[];
  }>;
  createBet: (
    bet: Bet,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    accessCode: string;
    betId: string;
  }>;
  getBetAndPredictionOddsByBetId: (
    betId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    betInfo: BetInfo | null;
    alreadyBet: Boolean;
    userSelection: SelectionBet | null;
  }>;
  getBetAndPredictionOddsByCode: (
    code: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    betInfo: BetInfo | null;
    alreadyBet: Boolean;
    userSelection: SelectionBet | null;
  }>;
  joinBet: (
    betId: string,
    selection: SelectionBet,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  myBets: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    bets: BetInfo[];
  }>;
  betSetResults: (
    betId: string,
    bet: setBet[],
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  getSyntheticMatches: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    syntheticMatch: SyntheticMatch[];
  }>;
  saveSyntheticMatches: (
    score: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  getUser: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    user: User | null;
  }>;
  getUsers: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    users: User[];
  }>;
  getMatchesToday: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    matches: LiveMatch[];
  }>;
  getMatchesTodayFromLeague: (
    leagueId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    matches: LiveMatch[];
  }>;
  getTeamSummary: (
    teamId: string,
    leagueId: string,
    season: number,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    teamSummaty: TeamSummary | null;
  }>;
  getLeagues: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    leagues: LeagueB[];
  }>;
  isLiveMatch: (
    fixtureId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    isLive: boolean;
  }>;
  getLeaguesCountry: (
    country: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    leaguesCountry: NationalLeague[];
  }>;
  getNationalTournaments: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    leaguesCountry: NationalLeague[];
  }>;
  getNationalMatchesToday: (isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
    matches: LiveMatch[];
  }>;
  searchPlayers: (
    search: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    players: PlayerB[];
  }>;
  searchCoaches: (
    search: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    coaches: Coach[];
  }>;
  searchTeams: (
    search: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
    teams: Team[];
  }>;
  ratePlayer: (
    rate: number,
    fixtureId: string,
    playerId: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  loadWorldTop10: (
    formData: FormData,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  getVideosWorldTop10: (isRetry?: boolean) => Promise<{
    videos: WeeklyWorldTopVideo[];
    success: boolean;
    message?: string;
  }>;
  editWorldTop10: (
    id: string,
    formData: FormData,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  deleteWorldTop10: (
    id: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  loadSyntheticVideo: (
    formData: FormData,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  getSyntheticVideo: (
    week: string,
    isRetry?: boolean
  ) => Promise<{
    videos: WeeklyGoalVideo[];
    success: boolean;
    message?: string;
  }>;
  editSyntheticVideo: (
    id: string,
    formData: FormData,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  deleteSyntheticVideo: (
    id: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  toggleFavoriteVideo: (
    id: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    favorites: number;
    isFavorite: boolean;
    canVote: boolean;
    votesUsed: number;
    message?: string;
  }>;
  getUsersNews: (isRetry?: boolean) => Promise<{
    success: boolean;
    userNews: NewsItem[];
    message?: string;
  }>;
  deleteUsersNews: (
    id: string,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    userNews: NewsItem[];
    message?: string;
  }>;
  createUserNew: (
    userNew: NewsPayload,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  editUserNew: (
    id: string,
    userNew: NewsPayload,
    isRetry?: boolean
  ) => Promise<{
    success: boolean;
    message?: string;
  }>;
  getGeneralUsersNews: (isRetry?: boolean) => Promise<{
    success: boolean;
    userNews: NewsItem[];
    message?: string;
  }>;
  getUserNew: (id: string, isRetry?: boolean) => Promise<{
    success: boolean;
    userNews: NewsItem | null;
    message?: string;
  }>;
  getOneByOne: (isRetry?: boolean) => Promise<{
    success: boolean;
    oneByOneList: OneByOne[];
    message?: string;
  }>;
  deleteOneByOneItem: (id: string, isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
  }>;
  getFinishedMatches: (isRetry?: boolean) => Promise<{
    success: boolean;
    fixtures: LiveMatch[];
    message?: string;
  }>;
  editOneByOne: (id: string, item: OneByOne, isRetry?: boolean) => Promise<{
    success: boolean;
    oneByOneItem: OneByOne | null;
    message?: string;
  }>;
  saveOneByOne: (item: OneByOne, isRetry?: boolean) => Promise<{
    success: boolean;
    oneByOneItem: OneByOne | null;
    message?: string;
  }>;
  sendComment: (id: string, text: string, isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
  }>;
  likeShort: (id: string, isRetry?: boolean) => Promise<{
    success: boolean;
    message?: string;
  }>;
};

const FetchContext = createContext<FetchContextType | undefined>(undefined);

const refreshToken = async () => {
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  const data = await fetch(`${apiUrl}/user/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: refreshToken }),
  });

  const { accessToken: newAccessToken } = await data.json();

  if (!newAccessToken) {
    await AsyncStorage.clear();
    throw new Error("Debes iniciar sesión de nuevo");
  }

  await AsyncStorage.setItem("accessToken", newAccessToken);
};

export const FetchProvider = ({ children }: { children: ReactNode }) => {
  const getCountries = async (
    isRetry?: boolean
  ): Promise<{ success: boolean; data: Country[]; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/country/countries`, {
        headers: { authorization: token },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getCountries(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            data: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message || "Error al obtener países",
          data: [],
        };
      }

      return { success: true, data: data.countries };
    } catch (error: any) {
      return { success: false, message: error.message, data: [] };
    }
  };

  const getLeagueFromCountry = async (
    country: string,
    isRetry?: boolean
  ): Promise<{ success: boolean; data: LeagueB[]; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/league/leaguesfromcountry/${country}`,
        {
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLeagueFromCountry(country, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            data: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          data: [],
        };
      }
      return { success: true, data: data.leagues };
    } catch (error: any) {
      return { success: false, message: error.message, data: [] };
    }
  };

  const getTeamsFromLeague = async (
    leagueId: number,
    isRetry?: boolean
  ): Promise<{ success: boolean; data: Team[]; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    const season = 0;
    try {
      const response = await fetch(
        `${apiUrl}/team/teams/${leagueId}/${season}`,
        {
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getTeamsFromLeague(leagueId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            data: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          data: [],
        };
      }
      return { success: true, data: data.teams };
    } catch (error: any) {
      return { success: false, message: error.message, data: [] };
    }
  };

  const getPlayerFromTeam = async (
    teamId: string,
    isRetry?: boolean
  ): Promise<{ success: boolean; data: PlayerB[]; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/player/playersByTeam/${teamId}`, {
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPlayerFromTeam(teamId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            data: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          data: [],
        };
      }
      return { success: true, data: data.players };
    } catch (error: any) {
      return { success: false, message: error.message, data: [] };
    }
  };

  const getCoachesFromLeague = async (
    leagueId: number,
    isRetry?: boolean
  ): Promise<{ success: boolean; data: Coach[]; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    const season = 0;
    try {
      const response = await fetch(
        `${apiUrl}/coach/coachesByLeague/${leagueId}/${season}`,
        {
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getCoachesFromLeague(leagueId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            data: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          data: [],
        };
      }
      return { success: true, data: data.coaches };
    } catch (error: any) {
      return { success: false, message: error.message, data: [] };
    }
  };

  const saveFavorites = async (
    favoritesList: Favorites,
    isRetry?: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/favorites/saveFavorites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(favoritesList),
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await saveFavorites(favoritesList, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const registerNotificationToken = async (
    notificationToken: string,
    isRetry?: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/user/updateNotificationsToken`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({
          updateNotificationsToken: notificationToken,
        }),
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await registerNotificationToken(notificationToken, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const getFavorites = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    teams: swiperItem[];
    players: swiperItem[];
    leagues: swiperItem[];
    coaches: swiperItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/favorites/getFavorites`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getFavorites(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            teams: [],
            players: [],
            leagues: [],
            coaches: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          teams: [],
          players: [],
          leagues: [],
          coaches: [],
        };
      }
      return {
        success: true,
        teams: data.equipos,
        players: data.jugadores,
        leagues: data.ligas,
        coaches: data.entrenadores,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        teams: [],
        players: [],
        leagues: [],
        coaches: [],
      };
    }
  };

  const getTeam = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    team: Team;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/team/getTeam/${id}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getTeam(id, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            team: {
              teamId: "",
              name: "",
              logo: "",
              country: "",
              leagueId: 0,
            },
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          team: {
            teamId: "",
            name: "",
            logo: "",
            country: "",
            leagueId: 0,
          },
        };
      }
      return {
        success: true,
        team: data.team,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        team: {
          teamId: "",
          name: "",
          logo: "",
          country: "",
          leagueId: 0,
        },
      };
    }
  };

  const getNewsTeam = async (
    team: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    news: swiperItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/news/listnews/${team}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getNewsTeam(team, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            news: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          news: [],
        };
      }
      const news: swiperItem[] = data.news.map((item: any) => ({
        id: item._id || item.url,
        title: item.title,
        img: item.image,
        pathTo: item.url,
        description: item.description,
        date: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
        source: item.source,
      }));

      return {
        success: true,
        news,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        news: [],
      };
    }
  };

  const getNextTeamMatch = async (
    teamId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    fixture: Fixture | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/fixture/nextMatch/${teamId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getNextTeamMatch(teamId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            fixture: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          fixture: null,
        };
      }

      const fixture: Fixture | null = data
        ? {
            fixtureId: data.fixture?.fixtureId ?? 0,
            date: data.fixture?.date ? new Date(data.fixture.date) : new Date(),
            referee: data.fixture?.referee ?? "",
            venue: {
              id: data.fixture?.venue?.id ?? 0,
              name: data.fixture?.venue?.name ?? "",
              city: data.fixture?.venue?.city ?? "",
            },
            teams: {
              home: {
                id: data.fixture.teams?.home?.id ?? 0,
                name: data.fixture.teams?.home?.name ?? "",
                logo: data.fixture.teams?.home?.logo ?? "",
              },
              away: {
                id: data.fixture.teams?.away?.id ?? 0,
                name: data.fixture.teams?.away?.name ?? "",
                logo: data.fixture.teams?.away?.logo ?? "",
              },
            },
            league: {
              id: data.fixture.league?.id ?? 0,
              name: data.fixture.league?.name ?? "",
              season: data.fixture.league?.season ?? 0,
              logo: data.fixture.league?.logo ?? "",
              round: data.fixture.league?.round ?? "",
            },
            goals: {
              home: 0,
              away: 0,
            },
          }
        : null;
      return {
        success: true,
        fixture,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        fixture: null,
      };
    }
  };

  const getPreviousAndPostTeamMatches = async (
    teamId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    pastFixtures: Fixture[];
    upcomingFixtures: Fixture[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    const season = 0;
    try {
      const response = await fetch(
        `${apiUrl}/fixture/previousMatches/${teamId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPreviousAndPostTeamMatches(teamId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            pastFixtures: [],
            upcomingFixtures: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          pastFixtures: [],
          upcomingFixtures: [],
        };
      }

      const pastFixtures: Fixture[] = data.pastFixtures;
      const upcomingFixtures: Fixture[] = data.upcomingFixtures;

      return {
        success: true,
        pastFixtures,
        upcomingFixtures,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        pastFixtures: [],
        upcomingFixtures: [],
      };
    }
  };

  const getLeaguesByTeam = async (
    teamId: string,
    season: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    competitions: Competitions[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/league/leaguesByTeam/${teamId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLeaguesByTeam(teamId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            competitions: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          competitions: [],
        };
      }

      const competitions = data.leagues;
      return {
        success: true,
        competitions,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        competitions: [],
      };
    }
  };

  const getStangingsLeague = async (
    leagueId: string,
    season: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    standings: TeamStanding[];
    matches: LiveMatch[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/league/getLeagueStandings/${leagueId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getStangingsLeague(leagueId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            standings: [],
            matches: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          standings: [],
          matches: [],
        };
      }

      const { standings, matches } = data;
      return {
        success: true,
        standings,
        matches,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        standings: [],
        matches: [],
      };
    }
  };

  const getStangingsCup = async (
    leagueId: string,
    season: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    hasGroupPhase: boolean;
    groupPhase: GroupStanding[];
    knockoutPhase: CupStanding[];
    matches: LiveMatch[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/league/getCupStandings/${leagueId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getStangingsCup(leagueId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            hasGroupPhase: false,
            groupPhase: [],
            knockoutPhase: [],
            matches: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          hasGroupPhase: false,
          groupPhase: [],
          knockoutPhase: [],
          matches: [],
        };
      }

      return {
        success: true,
        hasGroupPhase: data.hasGroupPhase,
        groupPhase: data.groupPhase,
        knockoutPhase: data.knockoutPhase,
        matches: data.liveMatches,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        hasGroupPhase: false,
        groupPhase: [],
        knockoutPhase: [],
        matches: [],
      };
    }
  };

  const getFriendlyMatches = async (
    teamId: string,
    season: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    fixtures: Fixture[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/league/getFriendlyStandings/${teamId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getFriendlyMatches(teamId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            fixtures: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          fixtures: [],
        };
      }

      return {
        success: true,
        fixtures: data.standings,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        fixtures: [],
      };
    }
  };

  const getPlayersStatsByTeam = async (
    teamId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    stats: TeamPlayerStatsByLeague[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    const season = 0;
    try {
      const response = await fetch(
        `${apiUrl}/team/teamStats/${teamId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPlayersStatsByTeam(teamId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            stats: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          stats: [],
        };
      }

      return {
        success: true,
        stats: data.stats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        stats: [],
      };
    }
  };

  const getSquadByTeam = async (
    teamId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    squad: TeamPlayerStatsByLeague | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/team/squad/${teamId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getSquadByTeam(teamId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            squad: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          squad: null,
        };
      }

      return {
        success: true,
        squad: data.squad,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        squad: null,
      };
    }
  };

  const getCoachByTeam = async (
    teamId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    coach: Coach | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/coach/getCoachByTeam/${teamId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getCoachByTeam(teamId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            coach: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          coach: null,
        };
      }

      return {
        success: true,
        coach: data.coach,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        coach: null,
      };
    }
  };

  const getNewsSignAndRumorTeam = async (
    teamId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    newSigns: swiperItem[];
    newRumor: swiperItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/news/rumorNews/${teamId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getNewsSignAndRumorTeam(teamId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            newSigns: [],
            newRumor: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          newSigns: [],
          newRumor: [],
        };
      }
      const newsSigns: swiperItem[] = data.newsSign.map((item: any) => ({
        id: item._id || item.url,
        title: item.title,
        img: "",
        pathTo: item.url,
        description: "",
        date: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
        source: item.source,
      }));
      const newsRumor: swiperItem[] = data.newsRumor.map((item: any) => ({
        id: item._id || item.url,
        title: item.title,
        img: item.image,
        pathTo: item.url,
        description: item.description,
        date: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
        source: item.source,
      }));

      return {
        success: true,
        newSigns: newsSigns,
        newRumor: newsRumor,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        newSigns: [],
        newRumor: [],
      };
    }
  };

  const getNewsSignAndRumorFavoritesAndGeneral = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    newsFavorites: swiperItem[];
    newsGeneral: swiperItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/news/rumorNewsFavoritesGeneral`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getNewsSignAndRumorFavoritesAndGeneral(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            newsFavorites: [],
            newsGeneral: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          newsFavorites: [],
          newsGeneral: [],
        };
      }
      const newsFavorites: swiperItem[] = data.newsFavorites.map(
        (item: any) => ({
          id: item._id || item.url,
          title: item.title,
          img: "",
          pathTo: item.url,
          description: "",
          date: item.publishedAt
            ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : undefined,
          source: item.source,
        })
      );

      const newsGeneral: swiperItem[] = data.generalNews.map((item: any) => ({
        id: item._id || item.url,
        title: item.title,
        img: "",
        pathTo: item.url,
        description: "",
        date: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
        source: item.source,
      }));

      return {
        success: true,
        newsFavorites,
        newsGeneral,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        newsFavorites: [],
        newsGeneral: [],
      };
    }
  };

  const getInfoPlayer = async (
    playerId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    player: PlayerB | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    const season = 0;
    try {
      const response = await fetch(
        `${apiUrl}/player/infoPlayer/${playerId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getInfoPlayer(playerId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            player: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          player: null,
        };
      }

      return {
        success: true,
        player: data.player,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        player: null,
      };
    }
  };

  const getPlayerNews = async (
    playerId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    news: swiperItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/news/playerNews/${playerId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPlayerNews(playerId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            news: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          news: [],
        };
      }
      const news: swiperItem[] = data.news.map((item: any) => ({
        id: item._id || item.url,
        title: item.title,
        img: "",
        pathTo: item.url,
        description: "",
        date: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
        source: item.source,
      }));

      return {
        success: true,
        news,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        news: [],
      };
    }
  };

  const getPlayerSeasons = async (
    playerId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    seasons: number[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/playerSeason/getplayerSeasons/${playerId}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPlayerSeasons(playerId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            seasons: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          seasons: [],
        };
      }

      const seasons = data.seasons;

      return {
        success: true,
        seasons,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        seasons: [],
      };
    }
  };

  const getPlayerCareer = async (
    playerId: string,
    season: number,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    playerCareer: PlayerCareer | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/playerCareer/getplayerCareer/${playerId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPlayerCareer(playerId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            playerCareer: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          playerCareer: null,
        };
      }

      const career = data.career;

      return {
        success: true,
        playerCareer: career,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        playerCareer: null,
      };
    }
  };

  const getLeague = async (
    leagueId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    league: LeagueB | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/league/getLeague/${leagueId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLeague(leagueId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            league: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          league: null,
        };
      }

      const league = data.league;
      return {
        success: true,
        league,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        league: null,
      };
    }
  };

  const getLeagueNews = async (
    leagueId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    news: swiperItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/news/leagueNews/${leagueId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLeagueNews(leagueId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            news: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          news: [],
        };
      }
      const news: swiperItem[] = data.news.map((item: any) => ({
        id: item._id || item.url,
        title: item.title,
        img: "",
        pathTo: item.url,
        description: "",
        date: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
        source: item.source,
      }));

      return {
        success: true,
        news,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        news: [],
      };
    }
  };

  const getPreviousAndPostLeagueMatches = async (
    leagueId: string,
    season: number,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    pastFixtures: Fixture[];
    upcomingFixtures: Fixture[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/fixturesLeague/${leagueId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPreviousAndPostLeagueMatches(leagueId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            pastFixtures: [],
            upcomingFixtures: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          pastFixtures: [],
          upcomingFixtures: [],
        };
      }

      const pastFixtures: Fixture[] = data.pastFixtures;
      const upcomingFixtures: Fixture[] = data.upcomingFixtures;

      return {
        success: true,
        pastFixtures,
        upcomingFixtures,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        pastFixtures: [],
        upcomingFixtures: [],
      };
    }
  };

  const getLeagueStats = async (
    leagueId: string,
    season: number,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    stats: StatsByCategory | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/league/getleagueStats/${leagueId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLeagueStats(leagueId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            stats: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          stats: null,
        };
      }

      const stats = data.stats;

      return {
        success: true,
        stats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        stats: null,
      };
    }
  };

  const getCoachInfo = async (
    coachId: string,
    season: number,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    coach: CoachStats | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/coach/getCoachInfo/${coachId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getCoachInfo(coachId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            coach: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          coach: null,
        };
      }

      const coach = data.coach;

      return {
        success: true,
        coach,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        coach: null,
      };
    }
  };

  const getCoachNews = async (
    coachId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    news: swiperItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/news/coachNews/${coachId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getCoachNews(coachId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            news: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          news: [],
        };
      }
      const news: swiperItem[] = data.news.map((item: any) => ({
        id: item._id || item.url,
        title: item.title,
        img: "",
        pathTo: item.url,
        description: "",
        date: item.publishedAt
          ? new Date(item.publishedAt).toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : undefined,
        source: item.source,
      }));

      return {
        success: true,
        news,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        news: [],
      };
    }
  };

  const getFixture = async (
    fixtureId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    fixture: Fixture | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/fixtureById/${fixtureId}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getFixture(fixtureId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            fixture: null,
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          fixture: null,
        };
      }

      return {
        success: true,
        fixture: data.fixture,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        fixture: null,
      };
    }
  };

  const getVideoFromYoutube = async (
    query: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/youtube/videos/${query}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getVideoFromYoutube(query, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            videos: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          videos: [],
        };
      }

      const { videos } = data;

      return {
        success: true,
        videos,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        videos: [],
      };
    }
  };

  const getVideoTeamFromYoutube = async (
    team: string,
    query: string,
    season?: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/youtube/videosTeam/${team}/${query}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getVideoTeamFromYoutube(query, team, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            videos: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          videos: [],
        };
      }

      const { videos } = data;

      return {
        success: true,
        videos,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        videos: [],
      };
    }
  };

  const getVideoMatchFromYoutube = async (
    teamA: string,
    teamB: string,
    query: string,
    season?: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/youtube/videosMatch/${teamA}/${teamB}/${query}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getVideoMatchFromYoutube(
            teamA,
            teamB,
            query,
            season,
            true
          );
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            videos: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          videos: [],
        };
      }

      const { videos } = data;

      return {
        success: true,
        videos,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        videos: [],
      };
    }
  };

  const getVideoPlayerFromYoutube = async (
    player: string,
    query: string,
    season?: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    videos: VideoYoutube[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/youtube/videosPlayer/${player}/${query}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getVideoTeamFromYoutube(player, query, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            videos: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          videos: [],
        };
      }

      const { videos } = data;

      return {
        success: true,
        videos,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        videos: [],
      };
    }
  };

  const getFavoritesVideos = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    videosTeams: VideoYoutube[];
    videosPlayers: VideoYoutube[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/youtube/videosFavorites`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getFavoritesVideos(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            videosTeams: [],
            videosPlayers: [],
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          videosTeams: [],
          videosPlayers: [],
        };
      }

      const { videosTeams, videosPlayers } = data;

      return {
        success: true,
        videosTeams,
        videosPlayers,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        videosTeams: [],
        videosPlayers: [],
      };
    }
  };

  const getFixturePrediction = async (
    fixtureId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    prediction: Prediction | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/predictions/fixture/${fixtureId}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getFixturePrediction(fixtureId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            prediction: null,
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          prediction: null,
        };
      }

      const { prediction } = data;

      return {
        success: true,
        prediction,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        prediction: null,
      };
    }
  };

  const getFeaturedPlayerByTeamLeague = async (
    fixtureId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    playerFixtureStatsHome: PlayerFixtureStats | null;
    playerFixtureStatsAway: PlayerFixtureStats | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/featuredPlayers/${fixtureId}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getFeaturedPlayerByTeamLeague(fixtureId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            playerFixtureStatsHome: null,
            playerFixtureStatsAway: null,
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          playerFixtureStatsHome: null,
          playerFixtureStatsAway: null,
        };
      }

      const { featuredHome, statsAway } = data;

      return {
        success: true,
        playerFixtureStatsHome: featuredHome,
        playerFixtureStatsAway: statsAway,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        playerFixtureStatsHome: null,
        playerFixtureStatsAway: null,
      };
    }
  };

  const getPreMatchStats = async (
    fixtureId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    stats: PreMatchStats | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/preMatchStats/${fixtureId}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPreMatchStats(fixtureId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            stats: null,
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          stats: null,
        };
      }

      const { stats } = data;

      return {
        success: true,
        stats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        stats: null,
      };
    }
  };

  const getLineUp = async (
    fixtureId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    lineup: Lineup | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/fixtureLineup/${fixtureId}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLineUp(fixtureId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            lineup: null,
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          lineup: null,
        };
      }

      const { lineup } = data;

      return {
        success: true,
        lineup,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        lineup: null,
      };
    }
  };

  const getLiveMatch = async (
    fixtureId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    live: LiveMatch | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/fixture/liveMatch/${fixtureId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLiveMatch(fixtureId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            live: null,
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          live: null,
        };
      }

      const { live } = data;

      return {
        success: true,
        live,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        live: null,
      };
    }
  };

  const getPredictionOdds = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    predictionOdds: PredictionOddsItem[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/predictionOdds/upcoming`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getPredictionOdds(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            predictionOdds: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          predictionOdds: [],
        };
      }

      const { predictionodds } = data;

      return {
        success: true,
        predictionOdds: predictionodds,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        predictionOdds: [],
      };
    }
  };

  const createBet = async (
    bet: Bet,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    betId: string;
    accessCode: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/bet/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(bet),
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await createBet(bet, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            accessCode: "",
            betId: "",
          };
        }
      }

      const data = await response.json();
      const { betId, accessCode } = data;

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          accessCode: "",
          betId: "",
        };
      }
      return { success: true, accessCode, betId };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        accessCode: "",
        betId: "",
      };
    }
  };

  const getBetAndPredictionOddsByBetId = async (
    betId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    betInfo: BetInfo | null;
    alreadyBet: Boolean;
    userSelection: SelectionBet | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/bet/infoBetId/${betId}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getBetAndPredictionOddsByBetId(betId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            betInfo: null,
            alreadyBet: false,
            userSelection: null,
          };
        }
      }

      const data = await response.json();
      const { betInfo, alreadyBet, userSelection } = data;

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          betInfo: null,
          alreadyBet: false,
          userSelection: null,
        };
      }
      return { success: true, betInfo, alreadyBet, userSelection };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        betInfo: null,
        alreadyBet: false,
        userSelection: null,
      };
    }
  };

  const getBetAndPredictionOddsByCode = async (
    code: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    betInfo: BetInfo | null;
    alreadyBet: Boolean;
    userSelection: SelectionBet | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/bet/infoCode/${code}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getBetAndPredictionOddsByCode(code, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            betInfo: null,
            alreadyBet: false,
            userSelection: null,
          };
        }
      }

      const data = await response.json();
      const { betInfo, alreadyBet, userSelection } = data;

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          betInfo: null,
          alreadyBet: false,
          userSelection: null,
        };
      }
      return { success: true, betInfo, alreadyBet, userSelection };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        betInfo: null,
        alreadyBet: false,
        userSelection: null,
      };
    }
  };

  const joinBet = async (
    betId: string,
    selection: SelectionBet,
    isRetry?: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/bet/joinBet/${betId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(selection),
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await joinBet(betId, selection, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const myBets = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    bets: BetInfo[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/bet/myBets/`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await myBets(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            bets: [],
          };
        }
      }

      const data = await response.json();
      const { bets } = data;

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          bets: [],
        };
      }
      return { success: true, bets };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        bets: [],
      };
    }
  };

  const betSetResults = async (
    betId: string,
    bet: setBet[],
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/bet/betSetResults/${betId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify({
          betResume: bet,
        }),
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await betSetResults(betId, bet, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getSyntheticMatches = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    syntheticMatch: SyntheticMatch[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/syntheticMatch/getMatches/`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getSyntheticMatches(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            syntheticMatch: [],
          };
        }
      }

      const data = await response.json();
      const { syntheticMatch } = data;

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          syntheticMatch: [],
        };
      }
      return { success: true, syntheticMatch };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        syntheticMatch: [],
      };
    }
  };

  const getUser = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    user: User | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/user/getUser`, {
        headers: {
          authorization: token,
        },
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getUser(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            user: null,
          };
        }
      }

      const data = await response.json();
      const { user } = data;

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          user: null,
        };
      }
      return { success: true, user };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        user: null,
      };
    }
  };

  const getUsers = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    users: User[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/user/getUsers`, {
        headers: {
          authorization: token,
        },
      });
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getUsers(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            users: [],
          };
        }
      }

      const data = await response.json();
      const { users } = data;

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          users: [],
        };
      }
      return { success: true, users };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        users: [],
      };
    }
  };

  const saveSyntheticMatches = async (
    score: string,
    isRetry?: boolean
  ): Promise<{ success: boolean; message?: string }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/syntheticMatch/saveMatches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(score),
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await saveSyntheticMatches(score, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message };
    }
  };

  const getMatchesToday = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    matches: LiveMatch[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/fixture/getMatchesDay`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getMatchesToday(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            matches: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          matches: [],
        };
      }

      const { matches } = data;

      return {
        success: true,
        matches,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        matches: [],
      };
    }
  };

  const getMatchesTodayFromLeague = async (
    leagueId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    matches: LiveMatch[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/getMatchesTodayFromLeague`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getMatchesTodayFromLeague(leagueId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            matches: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          matches: [],
        };
      }

      const { matches } = data;

      return {
        success: true,
        matches,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        matches: [],
      };
    }
  };

  const getTeamSummary = async (
    teamId: string,
    leagueId: string,
    season: number,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    teamSummaty: TeamSummary | null;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/teamSummary/getInfo/${teamId}/${leagueId}/${season}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getTeamSummary(teamId, leagueId, season, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            teamSummaty: null,
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          teamSummaty: null,
        };
      }

      const { summary } = data;

      return {
        success: true,
        teamSummaty: summary,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        teamSummaty: null,
      };
    }
  };

  const getLeagues = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    leagues: LeagueB[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/league/leagues`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLeagues(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            leagues: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          leagues: [],
        };
      }

      const { leagues } = data;

      return {
        success: true,
        leagues,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        leagues: [],
      };
    }
  };

  const isLiveMatch = async (
    fixtureId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    isLive: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/isLiveMatch/${fixtureId}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await isLiveMatch(fixtureId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            isLive: false,
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          isLive: false,
        };
      }

      const { isLive } = data;

      return {
        success: true,
        isLive,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        isLive: false,
      };
    }
  };

  const getLeaguesCountry = async (
    country: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    leaguesCountry: NationalLeague[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/nationLeague/getTournamentsFromCountry/${country}`,
        {
          method: "GET",
          headers: {
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getLeaguesCountry(country, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            leaguesCountry: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          leaguesCountry: [],
        };
      }

      const { tournaments } = data;

      return {
        success: true,
        leaguesCountry: tournaments,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        leaguesCountry: [],
      };
    }
  };

  const getNationalTournaments = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    leaguesCountry: NationalLeague[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/nationLeague/getTournaments`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getNationalTournaments(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            leaguesCountry: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          leaguesCountry: [],
        };
      }

      const { tournaments } = data;

      return {
        success: true,
        leaguesCountry: tournaments,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        leaguesCountry: [],
      };
    }
  };

  const getNationalMatchesToday = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    matches: LiveMatch[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/fixture/getMatchesNationalDay`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getNationalMatchesToday(true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            matches: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          matches: [],
        };
      }

      const { matches } = data;

      return {
        success: true,
        matches,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        matches: [],
      };
    }
  };

  const searchPlayers = async (
    search: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    players: PlayerB[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/player/search/${search}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await searchPlayers(search, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            players: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          players: [],
        };
      }

      const { players } = data;

      return {
        success: true,
        players,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        players: [],
      };
    }
  };

  const searchCoaches = async (
    search: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    coaches: Coach[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/coach/search/${search}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await searchCoaches(search, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            coaches: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          coaches: [],
        };
      }

      const { coaches } = data;

      return {
        success: true,
        coaches,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        coaches: [],
      };
    }
  };

  const searchTeams = async (
    search: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
    teams: Team[];
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/team/search/${search}`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await searchTeams(search, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
            teams: [],
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
          teams: [],
        };
      }

      const { teams } = data;

      return {
        success: true,
        teams,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
        teams: [],
      };
    }
  };

  const ratePlayer = async (
    rate: number,
    fixtureId: string,
    playerId: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/fixture/ratePlayer/${fixtureId}/${playerId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          body: JSON.stringify({ rate }),
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await ratePlayer(rate, fixtureId, playerId, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const loadWorldTop10 = async (
    formData: FormData,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/weeklyWorldTop/save`, {
        method: "POST",
        headers: {
          authorization: token,
        },
        body: formData,
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await loadWorldTop10(formData, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getVideosWorldTop10 = async (
    isRetry?: boolean
  ): Promise<{
    videos: WeeklyWorldTopVideo[];
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/weeklyWorldTop/videos`, {
        method: "GET",
        headers: {
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getVideosWorldTop10(true);
        } catch (error) {
          return {
            videos: [],
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          videos: [],
          success: false,
          message: data.message,
        };
      }

      const videos = data.videos;

      return {
        videos,
        success: true,
      };
    } catch (error: any) {
      return {
        videos: [],
        success: false,
        message: error.message,
      };
    }
  };

  const editWorldTop10 = async (
    id: string,
    formData: FormData,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/weeklyWorldTop/weekVideo/${id}`, {
        method: "PUT",
        headers: {
          authorization: token,
        },
        body: formData,
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await editWorldTop10(id, formData, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const deleteWorldTop10 = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/weeklyWorldTop/weekVideo/${id}`, {
        method: "Delete",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await deleteWorldTop10(id, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const loadSyntheticVideo = async (
    formData: FormData,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(`${apiUrl}/weeklySyntheticTop/save`, {
        method: "POST",
        headers: {
          authorization: token,
        },
        body: formData,
      });

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await loadSyntheticVideo(formData, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getSyntheticVideo = async (
    week: string,
    isRetry?: boolean
  ): Promise<{
    videos: WeeklyGoalVideo[];
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/weeklySyntheticTop/weekVideo/${week}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getSyntheticVideo(week, true);
        } catch (error) {
          return {
            videos: [],
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          videos: [],
          success: false,
          message: data.message,
        };
      }

      const videos = data.videos;

      return {
        videos,
        success: true,
      };
    } catch (error: any) {
      return {
        videos: [],
        success: false,
        message: error.message,
      };
    }
  };

  const editSyntheticVideo = async (
    id: string,
    formData: FormData,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/weeklySyntheticTop/weekVideo/${id}`,
        {
          method: "PUT",
          headers: {
            authorization: token,
          },
          body: formData,
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await editSyntheticVideo(id, formData, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const deleteSyntheticVideo = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";
    try {
      const response = await fetch(
        `${apiUrl}/weeklySyntheticTop/weekVideo/${id}`,
        {
          method: "Delete",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );

      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await deleteSyntheticVideo(id, true);
        } catch (error) {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();
      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const toggleFavoriteVideo = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    videoId: string;
    isFavorite: boolean;
    favorites: number;
    canVote: boolean;
    votesUsed: number;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(
        `${apiUrl}/weeklySyntheticTop/setFavorite/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await toggleFavoriteVideo(id, true);
        } catch {
          return {
            success: false,
            videoId: id,
            isFavorite: false,
            canVote: false,
            votesUsed: 0,
            favorites: 0,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          videoId: id,
          isFavorite: false,
          canVote: false,
          votesUsed: 0,
          favorites: 0,
          message: data.message,
        };
      }

      return {
        success: true,
        videoId: data.videoId,
        isFavorite: data.isFavorite,
        canVote: true,
        votesUsed: data.votesUsed,
        favorites: data.favorites,
      };
    } catch (error: any) {
      return {
        success: false,
        videoId: id,
        isFavorite: false,
        favorites: 0,
        canVote: false,
        votesUsed: 0,
        message: error.message,
      };
    }
  };

  const getUsersNews = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    userNews: NewsItem[];
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/userNews/getNews/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getUsersNews(true);
        } catch {
          return {
            success: false,
            userNews: [],
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          userNews: [],
          message: data.message,
        };
      }

      return {
        success: true,
        userNews: data.news,
      };
    } catch (error: any) {
      return {
        success: false,
        userNews: [],
        message: error.message,
      };
    }
  };

  const deleteUsersNews = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    userNews: NewsItem[];
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/userNews/deleteNew/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await deleteUsersNews(id, true);
        } catch {
          return {
            success: false,
            userNews: [],
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          userNews: [],
          message: data.message,
        };
      }

      return {
        success: true,
        userNews: data.news,
      };
    } catch (error: any) {
      return {
        success: false,
        userNews: [],
        message: error.message,
      };
    }
  };

  const createUserNew = async (
    userNew: NewsPayload,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/userNews/createNew`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(userNew),
      });

      // Token expirado → refrescar y reintentar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await createUserNew(userNew, true);
        } catch {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const editUserNew = async (
    id: string,
    userNew: NewsPayload,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/userNews/editNew/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
        body: JSON.stringify(userNew),
      });

      // Token expirado → refrescar y reintentar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await editUserNew(id, userNew, true);
        } catch {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getGeneralUsersNews = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    userNews: NewsItem[];
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/userNews/getGeneralNews/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getGeneralUsersNews(true);
        } catch {
          return {
            success: false,
            userNews: [],
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          userNews: [],
          message: data.message,
        };
      }

      return {
        success: true,
        userNews: data.news,
      };
    } catch (error: any) {
      return {
        success: false,
        userNews: [],
        message: error.message,
      };
    }
  };

  const getUserNew = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    userNews: NewsItem | null;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/userNews/getUserNew/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getUserNew(id, true);
        } catch {
          return {
            success: false,
            userNews: null,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          userNews: null,
          message: data.message,
        };
      }

      return {
        success: true,
        userNews: data.news,
      };
    } catch (error: any) {
      return {
        success: false,
        userNews: null,
        message: error.message,
      };
    }
  };

  const getOneByOne = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    oneByOneList: OneByOne[];
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/oneByOne/getOneByOne`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getOneByOne(true);
        } catch {
          return {
            success: false,
            oneByOneList: [],
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          oneByOneList: [],
          message: data.message,
        };
      }

      return {
        success: true,
        oneByOneList: data.oneByOneList,
      };
    } catch (error: any) {
      return {
        success: false,
        oneByOneList: [],
        message: error.message,
      };
    }
  };

  const deleteOneByOneItem = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/oneByOne/deleteOneByOne/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await deleteOneByOneItem(id, true);
        } catch {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const getFinishedMatches = async (
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    fixtures: LiveMatch[];
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/match/finishedMatches`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          authorization: token,
        },
      });

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await getFinishedMatches(true);
        } catch {
          return {
            success: false,
            fixtures: [],
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          fixtures: [],
          message: data.message,
        };
      }

      return {
        success: true,
        fixtures: data.fixtures,
      };
    } catch (error: any) {
      return {
        success: false,
        fixtures: [],
        message: error.message,
      };
    }
  };

  const editOneByOne = async (
    id: string,
    item: OneByOne,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    oneByOneItem: OneByOne | null;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/oneByOne/edit/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          body: JSON.stringify(item)
        }
      );

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await editOneByOne(id, item, true);
        } catch {
          return {
            success: false,
            oneByOneItem: null,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          oneByOneItem: null,
          message: data.message,
        };
      }

      return {
        success: true,
        oneByOneItem: data.oneByOne,
        message: ''
      };
    } catch (error: any) {
      return {
        success: false,
        oneByOneItem: null,
        message: error.message,
      };
    }
  };

  const saveOneByOne = async (
    item: OneByOne,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    oneByOneItem: OneByOne | null;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/oneByOne/save/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
          body: JSON.stringify(item)
        }
      );

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await saveOneByOne(item, true);
        } catch {
          return {
            success: false,
            oneByOneItem: null,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          oneByOneItem: null,
          message: data.message,
        };
      }

      return {
        success: true,
        oneByOneItem: data.oneByOne,
        message: ''
      };
    } catch (error: any) {
      return {
        success: false,
        oneByOneItem: null,
        message: error.message,
      };
    }
  };

  const sendComment = async (
    id: string,
    text: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/shorts/comment/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: token,
          },
        }
      );

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await sendComment(id, text, true);
        } catch {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
        message: ''
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  const likeShort = async (
    id: string,
    isRetry?: boolean
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    let token = (await AsyncStorage.getItem("accessToken")) || "";

    try {
      const response = await fetch(`${apiUrl}/shorts/like/${id}`,
        {
          method: "POST",
          headers: {
            authorization: token,
          },
        }
      );

      // Si el token expiró → refrescar
      if (response.status === 403 && !isRetry) {
        try {
          await refreshToken();
          return await likeShort(id, true);
        } catch {
          return {
            success: false,
            message: "Iniciar sesión",
          };
        }
      }

      const data = await response.json();

      if (data.status !== "success") {
        return {
          success: false,
          message: data.message,
        };
      }

      return {
        success: true,
        message: ''
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      };
    }
  };

  return (
    <FetchContext.Provider
      value={{
        getCountries,
        getLeagueFromCountry,
        getTeamsFromLeague,
        getPlayerFromTeam,
        getCoachesFromLeague,
        saveFavorites,
        getFavorites,
        registerNotificationToken,
        getTeam,
        getNewsTeam,
        getNextTeamMatch,
        getPreviousAndPostTeamMatches,
        getLeaguesByTeam,
        getStangingsLeague,
        getStangingsCup,
        getFriendlyMatches,
        getPlayersStatsByTeam,
        getSquadByTeam,
        getCoachByTeam,
        getNewsSignAndRumorTeam,
        getNewsSignAndRumorFavoritesAndGeneral,
        getInfoPlayer,
        getPlayerNews,
        getPlayerSeasons,
        getPlayerCareer,
        getLeague,
        getLeagueNews,
        getPreviousAndPostLeagueMatches,
        getLeagueStats,
        getCoachInfo,
        getCoachNews,
        getFixture,
        getVideoFromYoutube,
        getVideoMatchFromYoutube,
        getVideoTeamFromYoutube,
        getVideoPlayerFromYoutube,
        getFavoritesVideos,
        getFixturePrediction,
        getFeaturedPlayerByTeamLeague,
        getPreMatchStats,
        getLineUp,
        getLiveMatch,
        getPredictionOdds,
        createBet,
        getBetAndPredictionOddsByBetId,
        getBetAndPredictionOddsByCode,
        joinBet,
        myBets,
        betSetResults,
        getSyntheticMatches,
        getUser,
        getUsers,
        saveSyntheticMatches,
        getMatchesToday,
        getTeamSummary,
        getLeagues,
        isLiveMatch,
        getLeaguesCountry,
        getNationalTournaments,
        getNationalMatchesToday,
        searchPlayers,
        searchCoaches,
        searchTeams,
        ratePlayer,
        getMatchesTodayFromLeague,
        loadWorldTop10,
        getVideosWorldTop10,
        deleteWorldTop10,
        editWorldTop10,
        loadSyntheticVideo,
        getSyntheticVideo,
        editSyntheticVideo,
        deleteSyntheticVideo,
        toggleFavoriteVideo,
        getUsersNews,
        deleteUsersNews,
        createUserNew,
        editUserNew,
        getGeneralUsersNews,
        getUserNew,
        getOneByOne,
        deleteOneByOneItem,
        getFinishedMatches,
        editOneByOne,
        saveOneByOne,
        sendComment,
        likeShort
      }}
    >
      {children}
    </FetchContext.Provider>
  );
};

export const useFetch = () => {
  const ctx = useContext(FetchContext);
  if (!ctx) throw new Error("useFetch must be used within fetchProvider");
  return ctx;
};
