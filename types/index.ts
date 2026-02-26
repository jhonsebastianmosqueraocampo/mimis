import { ImagePickerAsset } from "expo-image-picker";

export type LoginFormValues = {
  identifier: string;
  password: string;
};

export type RegisterFormValues = {
  identifier: string;
  password: string;
  confirmPassword: string;
};

export type BooleanStateProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export type MainHeaderProps = {
  title: string;
  action: React.Dispatch<React.SetStateAction<boolean>>;
};

export type swiperItem = {
  id: string;
  title: string;
  img: string;
  pathTo: string;
  description?: string;
  date?: string;
  source?: string;
};

export type SwiperListProps = {
  list: swiperItem[];
  action: (id: string) => void;
};

export type ScrollSectionProps = {
  title: string;
  list: swiperItem[];
  shape: "circle" | "square" | "news";
  action: (id: string) => void;
};

export type NewModalProps = BooleanStateProps & {
  item: swiperItem;
};

export type NotificationSettingProps = SwiperListProps & {
  labelDescription: string;
  settingSelectedTitle: string;
  handleChange: (event: string) => void;
  selectedSettingsValue: string;
  selectedItems: swiperItem[];
  handleToggle: (team: swiperItem) => void;
};

export type OwnTeams = {
  name: string;
  shield: File | null;
  colorPrincipal: string;
  colorSecundario: string;
  uniformePrincipal: File | null;
  uniformeSecundario: File | null;
  categoria: string;
  entrenador: string;
  presidente: string;
};

export type VerticalScrollProps = {
  listItems: swiperItem[];
  actionGeneralList: (id: string) => void;
};

export type NextMatchProps = {
  homeTeam: swiperItem;
  awayTeam: swiperItem;
  datetime: string;
  stadium: string;
  referee: string;
  tournament: string;
};

export type Competition = {
  id: string;
  name: string;
  country: string;
  img?: string;
  type: "league" | "cup" | "tournament";
  qualifications?: {
    label: string;
    from: number;
    to: number;
    color: string;
  }[];
};

export type League = {
  teamId: string;
  teamName: string;
  logoUrl: string;
  played: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
};

export type KnockoutMatch = {
  id: string;
  round: string;
  homeTeam: {
    id: string;
    name: string;
    logoUrl: string;
    score: number | null;
  };
  awayTeam: {
    id: string;
    name: string;
    logoUrl: string;
    score: number | null;
  };
};

type PhaseTournament = {
  group: string;
  standings: League[];
};

export type Tournament = {
  phase: PhaseTournament[];
  knockout: KnockoutMatch[];
};

export type Standing = {
  league?: League[];
  cup?: KnockoutMatch[];
  tournament?: Tournament;
};

export type SeasonResultsProps = {
  teamId?: string;
  league?: LeagueB;
  equiposFavoritos?: swiperItem[];
};

export type LeagueTableProps = {
  standings: TeamStanding[];
  matches?: LiveMatch[];
  teamId?: string;
  selectedTeam?: string;
  equiposFavoritos?: swiperItem[];
  setSelectedTeam: (value: React.SetStateAction<string | null>) => void;
};

export type CompetitionGoals = {
  [competition: string]: number;
};

export type Player = {
  id: number;
  name: string;
  totalStats: number;
  matches: number;
  photoUrl?: string;
  competitionStats: CompetitionGoals;
};

export type TopPlayerTeamStatsListProps = {
  playerStatTitle: string;
  statTitle: string;
  players: Player[];
  onViewPlayer?: (playerId: number) => void;
};

export type RootStackParamList = {
  oauthredirect: undefined;
  index: undefined;
  favorites: undefined;
  profile: undefined;
  favoriteTeams: undefined;
  favoritePlayers: undefined;
  stats: undefined;
  predictions: undefined;
  interviews: undefined;
  training: undefined;
  resumeAndGoals: undefined;
  transferNews: undefined;
  createTeam: undefined;
  register: undefined;
  login: undefined;
  selectFavorite: undefined;
  team: { id: string };
  player: { id: string };
  coach: { id: string };
  tournament: { id: string };
  match: { id: string };
  store: undefined;
  productDetail: paramsProduct;
  createBet: undefined;
  betInvite: { id: string } | undefined;
  bets: undefined;
  liveBet: { id: string };
  registerSyntheticMatch: undefined;
  countries: undefined;
  search: undefined;
  earnPoints: undefined;
  syntheticMatch: undefined;
  worldTop10Screen: undefined;
  WeekSyntheticResumeVideos: undefined;
  loadWorldResumeVideos: undefined;
  loadSyntheticResumeVideos: undefined;
  addNews: undefined;
  news: undefined;
  loadOneByOne: undefined;
  oneByOne: undefined;
  loadShorts: undefined;
  shorts: undefined;
  cart: undefined;
  purchaseSummary: { products: ProductStore[] };
  purchaseHistory: undefined;
};

export type paramsProduct = {
  product: Product;
};

export type Country = {
  _id?: string;
  name: string;
  code: string;
  flag: string;
};

export type LeagueB = {
  league: {
    id: number;
    name: string;
    type: string;
    logo?: string;
  };
  country: {
    name: string;
    code?: string;
    flag?: string;
  };
};

export type Team = {
  teamId: string;
  name: string;
  logo: string;
  country: string;
  leagueId: number;
};

export type PlayerStatistic = {
  team: {
    id?: number;
    name?: string;
    logo?: string;
  };
  league: {
    id?: number;
    name?: string;
    country?: string;
    logo?: string;
    flag?: string;
    season?: number;
  };
  games: {
    appearences?: number;
    lineups?: number;
    minutes?: number;
    number?: number;
    position?: string;
    rating?: string;
    captain?: boolean;
  };
  substitutes: {
    in?: number;
    out?: number;
    bench?: number;
  };
  shots: {
    total?: number;
    on?: number;
  };
  goals: {
    total?: number;
    conceded?: number;
    assists?: number;
    saves?: number;
  };
  passes: {
    total?: number;
    key?: number;
    accuracy?: string;
  };
  tackles: {
    total?: number;
    blocks?: number;
    interceptions?: number;
  };
  duels: {
    total?: number;
    won?: number;
  };
  dribbles: {
    attempts?: number;
    success?: number;
    past?: number;
  };
  fouls: {
    drawn?: number;
    committed?: number;
  };
  cards: {
    yellow?: number;
    yellowred?: number;
    red?: number;
  };
  penalty: {
    won?: number;
    commited?: number;
    scored?: number;
    missed?: number;
    saved?: number;
  };
};

export type TeamPlayer = {
  id: number;
  name: string;
  logo: string;
};

export type PlayerB = {
  playerId: number;
  firstname?: string;
  lastname?: string;
  name: string;
  age?: number;
  birth: {
    date: string;
    place: string;
    country: string;
  };
  nationality?: string;
  height?: string;
  weight?: string;
  injured?: boolean;
  photo?: string;
  team?: TeamPlayer;
  statistics: PlayerStatistic[];
};

export type Coach = {
  coachId: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  nationality?: string;
  photo?: string;
  team: {
    id: number;
    name?: string;
    logo?: string;
  };
  leagueId?: number;
};

export type FavoriteCategories =
  | "equipos"
  | "ligas"
  | "jugadores"
  | "entrenadores";

export type FavoritesState = Record<FavoriteCategories, string[]>;

export type Favorites = {
  equipos: string[];
  ligas: string[];
  jugadores: string[];
  entrenadores: string[];
};

export type PointsHistoryItem = {
  action: string;
  points: number;
  date: string;
};

export type User = {
  id: string;
  nickName: string;
  email: string;
  password?: string;
  role?: string;

  points: number;
  xp: number;
  level: string;

  betsWon: number;
  betsLost: number;
  redeemed: number;
  badges: string[];
  communityStats?: {
    officialMatchesPlayed: number;
    newsPublished: number;
    highlightsUploaded: number;
    matchesRated: number;
  };
  pointsHistory?: PointsHistoryItem[];
};

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  receivedAt: Date;
  read: boolean;
};

export type Fixture = {
  fixtureId: number;
  date: Date;
  referee: string;
  status?: {
    short: string;
    long: string;
    elapsed: number;
  };
  venue: {
    id: number;
    name: string;
    city: string;
  };
  teams: {
    home: {
      id: number;
      name: string;
      logo: string;
      winner?: boolean;
    };
    away: {
      id: number;
      name: string;
      logo: string;
      winner?: boolean;
    };
  };
  league: {
    id: number;
    name: string;
    season: number;
    logo: string;
    round: string;
  };
  goals: {
    home: number;
    away: number;
  };
};

export type Competitions = {
  team: {
    id: string;
  };
  league: {
    id: string;
    name: string;
    logo: string;
    leagueType: string;
  };
};

export type TeamStanding = {
  rank: number;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  points: number;
  goalsDiff: number;
  group: string;
  form: string;
  status: string;
  description: string;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  home: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  away: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  update: string;
};

export type CupStanding = {
  leagueId: number;
  season: number;
  round: string;
  date: Date;
  homeTeam: {
    id: number;
    name: string;
    logo: string;
  };
  awayTeam: {
    id: number;
    name: string;
    logo: string;
  };
  goals: {
    home: number;
    away: number;
  };
  score: {
    fulltime: {
      home: number;
      away: number;
    };
    extratime: {
      home: number;
      away: number;
    };
    penalty: {
      home: number;
      away: number;
    };
  };
  status: string;
  lastUpdate: Date;
};

export type GroupStanding = {
  leagueId: number;
  season: number;
  group: string;
  team: {
    id: number;
    name: string;
    logo: string;
  };
  rank: number;
  points: number;
  all: {
    played: number;
    win: number;
    draw: number;
    lose: number;
    goals: {
      for: number;
      against: number;
    };
  };
  lastUpdate: Date;
};

export type PlayerStats = {
  _id?: string;
  player: {
    id: number;
    name: string;
    age: number;
    number?: number;
    position?: string;
    photo: string;
  };
  statistics: {
    _id?: string;
    team: {
      id: number;
      name: string;
      logo: string;
    };
    league: {
      id: number;
      name: string;
      logo: string;
      country: string;
      flag: string;
      season: number;
    };
    games: {
      appearences: number;
      lineups: number;
      minutes: number;
      number: number | null;
      position: string;
      rating: number | null;
      captain: boolean;
    };
    substitutes: {
      in: number;
      out: number;
      bench: number;
    };
    shots: {
      total: number | null;
      on: number | null;
    };
    goals: {
      total: number;
      conceded: number | null;
      assists: number | null;
      saves: number | null;
    };
    passes: {
      total: number | null;
      key: number | null;
      accuracy: number | null;
    };
    tackles: {
      total: number | null;
      blocks: number | null;
      interceptions: number | null;
    };
    duels: {
      total: number | null;
      won: number | null;
    };
    dribbles: {
      attempts: number | null;
      success: number | null;
      past: number | null;
    };
    fouls: {
      drawn: number | null;
      committed: number | null;
    };
    cards: {
      yellow: number;
      yellowred: number;
      red: number;
    };
    penalty: {
      won: number | null;
      commited: number | null;
      scored: number | null;
      missed: number | null;
      saved: number | null;
    };
  }[];
};

export type TeamPlayerStatsByLeague = {
  _id?: string;
  teamId: number;
  leagueId: number;
  season: number;
  lastUpdate: string;
  players: PlayerSquad[];
};

export type PlayerSquad = {
  id: number;
  name: string;
  age: number;
  number: number;
  position: string;
  photo: string;
};

export type CareerStat = {
  league: {
    id: number;
    name: string;
    country: string;
    season: number;
  };
  team: {
    id: number;
    name: string;
    logo: string;
  };
  games: {
    appearences: number;
    lineups: number;
    minutes: number;
    number: number;
    position: string;
    rating: number;
  };
  goals: {
    total: number;
    assists: number;
    conceded: number;
    saves: number;
  };
  cards: {
    yellow: number;
    red: number;
  };
  substitutes: {
    in: number;
    out: number;
    bench: number;
  };
  shots: {
    total: number;
    on: number;
  };
  passes: {
    total: number;
    key: number;
    accuracy: number;
  };
  tackles: {
    total: number;
    blocks: number;
    interceptions: number;
  };
  duels: {
    total: number;
    won: number;
  };
  dribbles: {
    attempts: number;
    success: number;
    past: number;
  };
  fouls: {
    drawn: number;
    committed: number;
  };
};

export type PlayerCareer = {
  name: string;
  nationality: string;
  photo: string;
  season: number;
  history: CareerStat[];
};

export type PlayerStat = {
  playerId: number;
  name: string;
  photo: string;
  teamId: number;
  teamName: string;
  minutes?: number;
  goals?: number;
  assists?: number;
  yellow?: number;
  red?: number;
  rating?: number;
  shotsTotal?: number;
  shotsOn?: number;
  keyPasses?: number;
  passesTotal?: number;
  dribblesAttempts?: number;
  dribblesSuccess?: number;
  tackles?: number;
  interceptions?: number;
  foulsDrawn?: number;
  foulsCommitted?: number;
};

export type StatsByCategory = {
  topScorers: PlayerStat[];
  topAssists: PlayerStat[];
  topYellowCards: PlayerStat[];
  topRedCards: PlayerStat[];

  topRating: PlayerStat[];
  topShotsTotal: PlayerStat[];
  topShotsOn: PlayerStat[];
  topKeyPasses: PlayerStat[];
  topPassesTotal: PlayerStat[];
  topDribblesSuccess: PlayerStat[];
  topDribblesAttempts: PlayerStat[];
  topTackles: PlayerStat[];
  topInterceptions: PlayerStat[];
  topFoulsDrawn: PlayerStat[];
  topFoulsCommitted: PlayerStat[];
};

export type SeasonStats = {
  season: number;
  team: {
    id: number;
    name?: string;
    logo?: string;
  };
  leagueId?: number;
  stats: {
    played: number;
    wins: number;
    draws: number;
    losses: number;
    goalsFor: number;
    goalsAgainst: number;
    winRate: string;
  };
  cachedAt: Date;
  lastUpdated: Date;
};

export type CoachStats = {
  coachId: number;
  name: string;
  firstname?: string;
  lastname?: string;
  age?: number;
  nationality?: string;
  photo?: string;
  history: SeasonStats[];
};

export type VideoYoutube = {
  videoId: string;
  title: string;
  description: string;
  channelTitle: string;
  thumbnail: string;
};

export type videosTypeYoutube = {
  name: string;
  videos: VideoYoutube[];
};

export type Tally3 = {
  home: number;
  away: number;
  total: number;
};

export type Avg3 = {
  home: string;
  away: string;
  total: string;
};

export type GoalsLeague = {
  for: {
    total: Tally3;
    average: Avg3;
  };
  against: {
    total: Tally3;
    average: Avg3;
  };
};

export type FixturesLeague = {
  played: Tally3;
  wins: Tally3;
  draws: Tally3;
  loses: Tally3;
};

export type Last5 = {
  form: string;
  att: string;
  def: string;
  goals: {
    for: { total: number; average: string };
    against: { total: number; average: string };
  };
};

export type TeamLeagueSummary = {
  fixtures: FixturesLeague;
  goals: GoalsLeague;
  form: string;
};

export type TeamInPrediction = {
  id: number;
  name: string;
  logo: string;
  last_5: Last5;
  league: TeamLeagueSummary;
};

export type H2H = {
  fixture: {
    id: number;
    date: string;
    timestamp: number;
    venue: {
      name: string;
      city: string;
    };
    status: { long: string; short: string; elapsed: number };
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean };
    away: { id: number; name: string; logo: string; winner: boolean };
  };
  goals: { home: number; away: number };
};

export type Prediction = {
  fixtureId: number;

  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: number;
  };

  fixture: {
    id: number;
    date: string;
    timestamp: number;
    timezone: string;
    venue: { id: number; name: string; city: string };
    status: { long: string; short: string; elapsed: number };
  };

  teams: {
    home: TeamInPrediction;
    away: TeamInPrediction;
  };

  comparison: {
    form: { home: string; away: string };
    att: { home: string; away: string };
    def: { home: string; away: string };
    poisson_distribution: { home: string; away: string };
    h2h: { home: string; away: string };
    goals: { home: string; away: string };
    total: { home: string; away: string };
  };

  predictions: {
    winner: { id: number; name: string; comment: string };
    win_or_draw: boolean;
    under_over: string;
    goals: { home: string; away: string };
    advice: string;
    percent: { home: string; draw: string; away: string };
  };

  h2h: H2H[];
};

export type PlayerFixtureStats = {
  player: {
    id: number;
    name: string;
    age: string;
    photo: string;
  };
  statistics: CareerStat[];
};

export type PreMatchStats = {
  _id: string;
  fixtureId: number;
  homeTeamId: number;
  awayTeamId: number;

  homeAverages: TeamAverages;
  awayAverages: TeamAverages;

  topScorers: {
    home: PlayerStatPreviewMatch[];
    away: PlayerStatPreviewMatch[];
  };

  topAssisters: {
    home: PlayerStatPreviewMatch[];
    away: PlayerStatPreviewMatch[];
  };

  headToHead: HeadToHeadMatch[];
  homeRecent: MatchSummary[];
  awayRecent: MatchSummary[];

  lastUpdated: string;
  __v: number;
};

export type TeamAverages = {
  possession: number;
  shots: number;
  passes: number;
};

export type PlayerStatPreviewMatch = {
  name: string;
  value: number;
};

export type HeadToHeadMatch = {
  fixture: FixtureDetail;
  league: LeagueInfo;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: ScoreDetail;
  goalscorers: GoalEvent[];
};

export type MatchSummary = {
  fixture: FixtureDetail;
  league: LeagueInfo;
  teams: {
    home: TeamInfo;
    away: TeamInfo;
  };
  goals: {
    home: number | null;
    away: number | null;
  };
  score: ScoreDetail;
};

export type FixtureDetail = {
  id: number;
  referee: string | null;
  timezone: string;
  date: string; // ISO string
  timestamp: number;
  periods: {
    first: number | null;
    second: number | null;
  };
  venue: {
    id: number | null;
    name: string | null;
    city: string | null;
  };
  status: {
    long: string;
    short: string;
    elapsed: number | null;
    extra: number | null;
  };
};

export type LeagueInfo = {
  id: number;
  name: string;
  country: string;
  logo: string;
  flag: string | null;
  season: number;
  round: string;
  standings: boolean;
};

export type TeamInfo = {
  id: number;
  name: string;
  logo: string;
  winner: boolean | null;
};

export type ScoreDetail = {
  halftime: {
    home: number | null;
    away: number | null;
  };
  fulltime: {
    home: number | null;
    away: number | null;
  };
  extratime: {
    home: number | null;
    away: number | null;
  };
  penalty: {
    home: number | null;
    away: number | null;
  };
};

export type GoalEvent = {
  minute: number;
  scorer: string;
  assist: string | null;
  teamId: number;
};

export type Lineup = {
  fixtureId: number;
  lineups: TeamLineup[];
  lastUpdated: string;
};

export type TeamLineup = {
  team: {
    id: number;
    name: string;
    logo: string;
    coach: CoachInfo;
    formation: string;
  };
  startXI: PlayerLineup[];
  substitutes: PlayerLineup[];
};

export type CoachInfo = {
  id: number;
  name: string;
  photo: string | null;
};

export type PlayerLineup = {
  id: number;
  name: string;
  number: number;
  pos: string;
  photo: string;
  grid: string;
  rating?: number;
};

export type LiveMatch = {
  _id?: string;
  fixtureId: number;
  fixture: {
    id: number;
    referee?: string;
    timezone: string;
    date: string; // ISO string que viene de la API
    timestamp: number;
    periods: {
      first?: number | null;
      second?: number | null;
    };
    venue: {
      id?: number;
      name?: string;
      city?: string;
    };
    status: {
      long: string;
      short: string;
      elapsed?: number | null;
    };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    season: number;
    round: string;
  };

  status: {
    long: string;
    short: string;
    elapsed: number;
  };

  teams: {
    home: TeamMini;
    away: TeamMini;
  };

  goals: {
    home: number;
    away: number;
  };

  events: LiveEvent[];

  statistics: TeamStatistics[];

  lineups: TeamLineupLive[];

  lastUpdated: string;
  __v?: number;
};

export type TeamMini = {
  id: number;
  name: string;
  logo: string;
};

export type LiveEvent = {
  time: { elapsed: number; extra?: number };
  team: TeamMini;
  player?: { id?: number; name?: string };
  assist?: { id?: number; name?: string };
  type: string;
  detail?: string;
  comments?: string;
};

export type StatItem = { type: string; value: number | string | null };

export type TeamStatistics = {
  team: TeamMini;
  statistics: StatItem[];
};

export type UserPlayerRating = {
  avg: number;
  votes: number;
};

export type PlayerLive = {
  id: number;
  name: string;
  number: number;
  pos: string;
  photo?: string;
  grid: string;
  isSub?: boolean;
  rating?: number;
  minutes?: number;
};

export type TeamLineupLive = {
  team: {
    id: number;
    name: string;
    logo: string;
    coach: { id: number; name: string; photo?: string | null };
    formation: string;
  };
  startXI: PlayerLive[];
  substitutes: PlayerLive[];
};

export type fullFixture = {
  fixtureId: string;
  date: Date;
  leagueId: string;
  season: string;
  teams: {
    home: {
      id: string;
      name: string;
      logo: string;
    };
    away: {
      id: string;
      name: string;
      logo: string;
    };
  };
  league: {
    id: string;
    name: string;
    country: string;
    logo: string;
    flag: string;
    season: string;
    round: string;
  };
  venue: {
    name: string;
    city: string;
  };
  referee: string;
  periods: {
    first: string;
    second: string;
  };
  status: {
    long: string;
    short: string;
    elapsed: string;
  };
  goals: {
    home: string;
    away: string;
  };
  score: {
    halftime: {
      home: string;
      away: string;
    };
    fulltime: {
      home: string;
      away: string;
    };
    extratime: {
      home: string;
      away: string;
    };
    penalty: {
      home: string;
      away: string;
    };
  };
};

export type PredictionOddsItem = {
  fixture: fullFixture;
  predictions?: any;
  odds?: any;
  lastUpdate: string;
};

export type setBet = {
  userId: string;
  winner: boolean;
};

export type UserBet = {
  userId: string;
  name: string;
  result: string;
  selection: SelectionBet;
};

export type Bet = {
  _id: string;
  fixtureId: string;
  stake: string;
  betType: string;
  users: UserBet[];
  liveMatch?: LiveMatch;
};

export type BetInfo = {
  bet: Bet;
  predictionOdds: PredictionOddsItem;
};

export type SelectionBet = {
  pick?: "LOCAL" | "DRAW" | "AWAY";
  home?: number;
  away?: number;
  side?: "OVER" | "UNDER";
  line?: number;
};

export type SyntheticMatchStatus =
  | "invitation"
  | "scheduled"
  | "rejected"
  | "cancelled"
  | "finished";

export type SyntheticMatch = {
  id: string;

  user: {
    nickName: string;
    email: string;
  };

  status: SyntheticMatchStatus;

  rejectionReason?: string;

  homeTeam?: {
    name: string;
    logo?: string;
  };

  awayTeam?: {
    name: string;
    logo?: string;
  };

  scheduledAt?: string;

  location?: {
    city?: string;
    field?: string;
    address?: string;
    mapsUrl?: string;
  };

  liveUrl?: string;

  score?: {
    home: number | null;
    away: number | null;
  };

  youtubeUrl?: string;

  createdAt: string;
  updatedAt?: string;
};

export type SyntheticMatchPayload = {
  homeTeam: { name: string; logo?: string };
  awayTeam: { name: string; logo?: string };
  scheduledAt: string;
  status: SyntheticMatchStatus;
  score: { home: number | null; away: number | null };
  location: {
    city: string;
    field: string;
    address?: string;
    mapsUrl?: string;
  };
  youtubeUrl?: string;
  liveUrl?: string;
};

export type CreateSyntheticMatchDTO = Omit<SyntheticMatchPayload, "score"> & {
  score?: { home: number; away: number }; // opcional si lo creas ya “finished/live”
};

export type UpdateSyntheticMatchDTO = Partial<CreateSyntheticMatchDTO> & {
  status?: SyntheticMatchStatus;
};

//teamsummary

export type SeasonProgress = {
  matchday: number; // número de jornada
  points: number; // puntos acumulados hasta esa jornada
  opponent: string; // nombre del rival
  result: "W" | "D" | "L"; // resultado
  score: string; // marcador (ej: "2-1")
  date: string; // fecha del partido
  position: number; // posición en la tabla
};

export type TopPlayer = {
  name: string;
  photo: string;
  goals: number;
  assists: number;
};

export type NextMatch = {
  opponent: string;
  date: string;
  home: boolean;
};

export type TeamSummary = {
  teamId: number;
  season: number;
  name: string;
  logoUrl: string;
  position: number;
  points: number;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  recentForm: string[];
  topPlayer: TopPlayer | null;
  nextMatch: NextMatch | null;
  seasonProgress: SeasonProgress[];
  lastUpdated: string | Date;
};

// fin teamsummary

export type Season = {
  year: number;
  start: string;
  end: string;
  current: boolean;
};

export type NationalLeague = {
  _id?: string;
  leagueId: number;
  name: string;
  type: string;
  logo: string;
  country: Country;
  team?: TeamInfo | null; // null si es torneo global (sin selección específica)
  seasons: Season[];
  updatedAt: string | Date;
};

export type WeeklyGoalVideo = {
  id: string;
  video: string;
  thumbail: string;
  user?: {
    id: string;
    name: string;
  };
  fixture: {
    teamA: string;
    teamB: string;
  };
  views: number;
  favorites: number;
  isFavorite: boolean;
  date: string;
  week: string;
};

export type WeeklyWorldTopVideo = {
  id: string;
  week: string;
  thumbail: string;
  video: string;
};

export type NewsItem = {
  id?: string;
  titulo: string;
  entidad: string;
  user: { id: string; name: string };
  fotoPrincipal: any;
  urlFotoPrincipal: string;
  desarrolloInicialNoticia: string;
  carruselFotos: { foto: string | ImagePickerAsset; url: string }[];
  desarrolloFinalNoticia: string;
  fecha?: string;
};

export type NewsPayload = {
  titulo: string;
  entidad: string;
  fotoPrincipal: any; // puede ser un File o una URL
  urlFotoPrincipal: string;
  desarrolloInicialNoticia: string;
  carruselFotos: { foto: string | ImagePickerAsset; url: string }[];
  desarrolloFinalNoticia: string;
};

export type CarruselFoto = {
  foto: string | ImagePickerAsset;
  url: string;
};

export type PlayerOneByOne = {
  playerId: number; // PlayerLive.id
  name: string; // PlayerLive.name (full name)
  number: number;
  pos: string;
  photo: string;
  grid?: string | null;
  isSub: boolean;
};

export type SquadOneByOne = {
  titulares: PlayerOneByOne[];
  suplentes: PlayerOneByOne[];
};

export type PlayerRating = {
  playerId: number;
  teamId: number;
  rating: number;
  title: string;
  description: string;
};

export type TeamOneByOne = {
  teamId: number;
  name: string;
  logo: string;
  players: SquadOneByOne;
  winner: boolean;
};

export type OneByOneType = {
  id?: string;

  fixtureId: number;

  result: {
    home: number;
    away: number;
  };

  teams: {
    home: TeamOneByOne;
    away: TeamOneByOne;
  };

  playerRatings?: PlayerRating[];

  createdAt: string;
  updatedAt: string;
};

export type LoadShortItem = {
  video: any;
  thumbnail: any;
  fecha: string;
  descripcion: string;
};

export type ShortItem = LoadShortItem & {
  id: string;
  favoritos: number;
  liked: boolean;
  comentarios: {
    user: User;
    comment: string;
  }[];
};

export type AnalysisOpenAi = {
  text: string;
  summary?: {
    title?: string;
    keyPoints?: string[];
    strengths?: string[];
    weaknesses?: string[];
    recommendations?: string[];
  };
  charts?: AnalysisCharts;
  generatedAt: string;
};

export type AnalysisCharts = {
  barCharts?: BarChartData[];
  lineCharts?: LineChartData[];
  pieCharts?: PieChartData[];
  radarCharts?: RadarChartData[];
  heatMaps?: HeatMapData[];
};

/* ---------------- Bar Chart ---------------- */
export type BarChartData = {
  id: string; // ej: "expected_goals"
  title: string;
  xLabels: string[];
  values: number[];
};

/* ---------------- Line Chart ---------------- */
export type LineChartData = {
  id: string; // ej: "form_last_10_games"
  title: string;
  points: number[]; // ej: [2,3,1,5,4]
  labels?: string[];
};

/* ---------------- Pie Chart ---------------- */
export type PieChartData = {
  id: string; // ej: "possession_distribution"
  title: string;
  slices: {
    label: string;
    value: number;
  }[];
};

/* ---------------- Radar Chart ---------------- */
export type RadarChartData = {
  id: string; // ej: "player_skills"
  title: string;
  axes: string[]; // ["pace","passing","shooting","defense"]
  values: number[]; // [85, 78, 92, 65]
};

/* ---------------- HeatMap ---------------- */
export type HeatMapData = {
  id: string; // ej: "player_touchmap"
  title: string;
  matrix: number[][]; // ej: zonas del campo
};

export type PlayerAnalysisProps = {
  playerId: string;
  stats: any;
};

export type FixtureAnalysisProps = {
  fixtureId: string;
  stats: any;
};

export type TeamSeasonAnalysisProps = {
  teamId: string;
  season: string;
  stats: any;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;

  variants: {
    color: string;
    colorHex?: String;
    images: string[];

    storeConfigs: {
      storeId: string;
      storeName?: string;
      size: string;
      price: number;
      stock: number;
    }[];
  }[];
};

//pedidos que hace el usuario
export type ProductStore = {
  id: string;
  storeId: string;
  productId: string;
  name: string;
  image: string;
  category: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  stock: number;
};

export type Purchase = {
  id: string;
  date: string;
  totalPoints: number;
  status?: string;
  items: {
    id: string;
    name: string;
    color: string;
    size: string;
    quantity: number;
    price: number;
  }[];
};

export type AddressForm = {
  recipientName: string;
  phone: string;

  city: string;
  neighborhood: string;
  streetType: "Calle" | "Carrera" | "Avenida" | "Diagonal" | "Transversal";
  streetNumber: string; // ej: "80"
  streetNumber2: string; // ej: "25"
  complement: string; // ej: "Apto 301, Torre 2, Conjunto X"

  references: string; // ej: "Portería, casa esquinera..."
  mapsUrl?: string; // opcional
};

// Estructura esperada para crear órdenes (una por tienda)
export type CreateOrderPayload = {
  address: string;
  orders: Array<{
    storeId: string;
    items: Array<{
      productId: string;
      name?: string;
      color: string;
      colorHex?: string;
      size: string;
      price: number;
      quantity: number;
    }>;
  }>;
};

export type Section = { title: string; data: LiveMatch[] };
export type LeagueItem = { id: number; name: string; logo: string };
