import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  BarChart3,
  TrendingUp,
  Calendar,
  Code
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface UserStats {
  totalSubmissions: number;
  acceptedSubmissions: number;
  problemsSolved: number;
  totalProblems: number;
  score: number;
  rank: number;
  recentSubmissions: Array<{
    _id: string;
    problemTitle: string;
    status: string;
    score: number;
    submittedAt: string;
    language: string;
  }>;
  difficultyStats: {
    easy: { solved: number; total: number };
    medium: { solved: number; total: number };
    hard: { solved: number; total: number };
  };
}

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }

    fetchUserStats();
  }, [isAuthenticated, navigate]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8080/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const accuracyRate = stats?.totalSubmissions ? 
    Math.round((stats.acceptedSubmissions / stats.totalSubmissions) * 100) : 0;

  const problemProgress = stats?.totalProblems ? 
    Math.round((stats.problemsSolved / stats.totalProblems) * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-muted-foreground">
            Track your coding progress and see how you're improving.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Score</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.score || 0}</div>
              <p className="text-xs text-muted-foreground">
                Rank #{stats?.rank || 'N/A'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problems Solved</CardTitle>
              <Target className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.problemsSolved || 0}/{stats?.totalProblems || 0}
              </div>
              <Progress value={problemProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Acceptance Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accuracyRate}%</div>
              <p className="text-xs text-muted-foreground">
                {stats?.acceptedSubmissions || 0}/{stats?.totalSubmissions || 0} accepted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <Code className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalSubmissions || 0}</div>
              <p className="text-xs text-muted-foreground">
                Keep coding!
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="submissions">Recent Submissions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Difficulty Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Difficulty Breakdown
                  </CardTitle>
                  <CardDescription>
                    Your progress across different difficulty levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">Easy</Badge>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.difficultyStats?.easy?.solved || 0}/{stats?.difficultyStats?.easy?.total || 0}
                      </span>
                    </div>
                    <Progress 
                      value={stats?.difficultyStats?.easy?.total ? 
                        (stats.difficultyStats.easy.solved / stats.difficultyStats.easy.total) * 100 : 0
                      } 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.difficultyStats?.medium?.solved || 0}/{stats?.difficultyStats?.medium?.total || 0}
                      </span>
                    </div>
                    <Progress 
                      value={stats?.difficultyStats?.medium?.total ? 
                        (stats.difficultyStats.medium.solved / stats.difficultyStats.medium.total) * 100 : 0
                      } 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Badge variant="secondary" className="bg-red-100 text-red-800">Hard</Badge>
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {stats?.difficultyStats?.hard?.solved || 0}/{stats?.difficultyStats?.hard?.total || 0}
                      </span>
                    </div>
                    <Progress 
                      value={stats?.difficultyStats?.hard?.total ? 
                        (stats.difficultyStats.hard.solved / stats.difficultyStats.hard.total) * 100 : 0
                      } 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Jump into coding or explore your progress
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => navigate('/problems')} 
                    className="w-full"
                  >
                    <Target className="mr-2 h-4 w-4" />
                    Solve Problems
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/leaderboard')} 
                    className="w-full"
                  >
                    <Trophy className="mr-2 h-4 w-4" />
                    View Leaderboard
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => window.location.reload()} 
                    className="w-full"
                  >
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Refresh Stats
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Learning Journey</CardTitle>
                <CardDescription>
                  Track your coding progress over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Progress Tracking</h3>
                  <p className="text-muted-foreground mb-4">
                    Your detailed progress charts will appear here as you solve more problems.
                  </p>
                  <Button onClick={() => navigate('/problems')}>
                    Start Solving Problems
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Submissions</CardTitle>
                <CardDescription>
                  Your latest coding attempts and results
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats?.recentSubmissions && stats.recentSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {stats.recentSubmissions.map((submission) => (
                      <div key={submission._id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          {submission.status === 'ACCEPTED' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{submission.problemTitle}</p>
                            <p className="text-sm text-muted-foreground">
                              {submission.language} • {new Date(submission.submittedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge 
                            variant={submission.status === 'ACCEPTED' ? 'default' : 'destructive'}
                            className="mb-1"
                          >
                            {submission.status}
                          </Badge>
                          <p className="text-sm text-muted-foreground">
                            +{submission.score} pts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Submissions Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start solving problems to see your submission history here.
                    </p>
                    <Button onClick={() => navigate('/problems')}>
                      Solve Your First Problem
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
