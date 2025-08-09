import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users,
  Target,
  Calendar,
  Award
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LeaderboardUser {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  score: number;
  rank: number;
  problemsSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  lastActive: string;
  isCurrentUser?: boolean;
}

interface LeaderboardStats {
  totalUsers: number;
  averageScore: number;
  topScore: number;
  yourRank: number;
}

export default function Leaderboard() {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [stats, setStats] = useState<LeaderboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (user) {
        const token = localStorage.getItem('token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      // Fetch leaderboard data
      const leaderboardResponse = await fetch(`http://localhost:8080/api/leaderboard?timeframe=${timeframe}`, {
        headers
      });
      
      // Fetch stats data
      const statsResponse = await fetch(`http://localhost:8080/api/leaderboard/stats?timeframe=${timeframe}`);
      
      if (leaderboardResponse.ok && statsResponse.ok) {
        const leaderboardResult = await leaderboardResponse.json();
        const statsResult = await statsResponse.json();
        
        if (leaderboardResult.success && statsResult.success) {
          // Transform the leaderboard data to match our interface
          const transformedLeaderboard = leaderboardResult.data.leaderboard.map((entry: any, index: number) => ({
            _id: entry.user._id,
            name: entry.user.name,
            email: entry.user.email || '',
            score: entry.score,
            rank: entry.rank,
            problemsSolved: entry.solvedCount,
            totalSubmissions: entry.solvedCount * 2, // Estimate based on solved problems
            acceptedSubmissions: entry.solvedCount,
            lastActive: entry.user.createdAt,
            isCurrentUser: user ? entry.user._id === user._id : false
          }));
          
          setLeaderboard(transformedLeaderboard);
          
          // Set stats from the stats API
          setStats({
            totalUsers: statsResult.data.totalUsers,
            averageScore: statsResult.data.averageScore,
            topScore: statsResult.data.topScore,
            yourRank: leaderboardResult.data.userRank || 0
          });
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      // Set empty data on error
      setLeaderboard([]);
      setStats({
        totalUsers: 0,
        averageScore: 0,
        topScore: 0,
        yourRank: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500 hover:bg-yellow-600">Champion</Badge>;
    if (rank <= 3) return <Badge className="bg-gray-500 hover:bg-gray-600">Top 3</Badge>;
    if (rank <= 10) return <Badge variant="secondary">Top 10</Badge>;
    return null;
  };

  const getAccuracyRate = (accepted: number, total: number) => {
    return total > 0 ? Math.round((accepted / total) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            See how you rank against other CodeCrack champions!
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Coders</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Active participants
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Score</CardTitle>
                <Award className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.topScore}</div>
                <p className="text-xs text-muted-foreground">
                  Highest achievement
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{Math.round(stats.averageScore)}</div>
                <p className="text-xs text-muted-foreground">
                  Community average
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Your Rank</CardTitle>
                <Target className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">#{stats.yourRank || 'N/A'}</div>
                <p className="text-xs text-muted-foreground">
                  Keep climbing!
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Timeframe Selector */}
        <Tabs value={timeframe} onValueChange={(value) => setTimeframe(value as any)} className="mb-6">
          <TabsList>
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Leaderboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Rankings
            </CardTitle>
            <CardDescription>
              Top performers in the CodeCrack community
            </CardDescription>
          </CardHeader>
          <CardContent>
            {leaderboard.length > 0 ? (
              <div className="space-y-4">
                {leaderboard.map((participant, index) => (
                  <div 
                    key={participant._id} 
                    className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                      participant.isCurrentUser 
                        ? 'bg-primary/5 border-primary/20 ring-2 ring-primary/10' 
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex items-center justify-center w-12 h-12">
                        {getRankIcon(participant.rank)}
                      </div>

                      {/* Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={participant.avatar} />
                        <AvatarFallback>
                          {participant.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      {/* User Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">
                            {participant.name}
                            {participant.isCurrentUser && (
                              <span className="text-primary text-sm ml-2">(You)</span>
                            )}
                          </h3>
                          {getRankBadge(participant.rank)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{participant.problemsSolved} problems solved</span>
                          <span>•</span>
                          <span>{getAccuracyRate(participant.acceptedSubmissions, participant.totalSubmissions)}% accuracy</span>
                          <span>•</span>
                          <span>Active {new Date(participant.lastActive).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {participant.score}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        points
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Rankings Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to appear on the leaderboard by solving problems!
                </p>
                <Button onClick={() => window.location.href = '/problems'}>
                  Start Coding
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How Rankings Work</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Earn points by solving problems correctly</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Harder problems give more points</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Faster solutions earn bonus points</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span>Rankings update in real-time</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
