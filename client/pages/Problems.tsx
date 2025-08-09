import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Search, Filter, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  testCases: Array<{
    input: string;
    expectedOutput: string;
    isPublic: boolean;
  }>;
  createdBy?: {
    _id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface ProblemsResponse {
  success: boolean;
  message: string;
  data: {
    problems: Problem[];
    pagination: {
      current: number;
      total: number;
      count: number;
      totalCount: number;
    };
  };
}

const difficultyColors = {
  easy: "bg-green-500/10 text-green-600 border-green-500/20",
  medium: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  hard: "bg-red-500/10 text-red-600 border-red-500/20"
};

const difficultyIcons = {
  easy: CheckCircle,
  medium: Clock,
  hard: AlertCircle
};

export default function Problems() {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const { toast } = useToast();
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    total: 1,
    count: 0,
    totalCount: 0
  });

  const fetchProblems = async (page = 1, search = "", difficulty = "") => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10"
      });

      if (search.trim()) {
        params.append("search", search.trim());
      }

      if (difficulty) {
        params.append("difficulty", difficulty);
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`http://localhost:8080/api/problems?${params}`, {
        headers
      });

      const data: ProblemsResponse = await response.json();

      if (data.success) {
        setProblems(data.data.problems);
        setPagination(data.data.pagination);
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to fetch problems",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to fetch problems:", error);
      toast({
        title: "Error",
        description: "Failed to fetch problems. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems(currentPage, searchQuery, difficultyFilter);
  }, [currentPage, token]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProblems(1, searchQuery, difficultyFilter);
  };

  const handleDifficultyChange = (difficulty: string) => {
    const filterValue = difficulty === "all" ? "" : difficulty;
    setDifficultyFilter(filterValue);
    setCurrentPage(1);
    fetchProblems(1, searchQuery, filterValue);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProblems(page, searchQuery, difficultyFilter);
  };

  const formatDescription = (description: string) => {
    return description.length > 200 ? description.substring(0, 200) + "..." : description;
  };

  const ProblemSkeleton = () => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-48" />
            <div className="flex items-center space-x-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Coding Problems</h1>
        <p className="text-muted-foreground">
          Practice your coding skills with our curated collection of problems
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 space-y-4 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search problems..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Select value={difficultyFilter || "all"} onValueChange={handleDifficultyChange}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>Search</Button>
        </div>
      </div>

      {/* Results Info */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          Showing {pagination.count} of {pagination.totalCount} problems
          {searchQuery && ` for "${searchQuery}"`}
          {difficultyFilter && ` (${difficultyFilter} difficulty)`}
        </div>
      )}

      {/* Problems List */}
      <div className="space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <ProblemSkeleton key={index} />)
        ) : problems.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No problems found.</p>
              {(searchQuery || difficultyFilter) && (
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearchQuery("");
                    setDifficultyFilter("");
                    setCurrentPage(1);
                    fetchProblems(1, "", "");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          problems.map((problem) => {
            const DifficultyIcon = difficultyIcons[problem.difficulty];
            return (
              <Card key={problem._id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle 
                        className="text-lg hover:text-primary cursor-pointer"
                        onClick={() => navigate(`/problems/${problem._id}`)}
                      >
                        {problem.title}
                      </CardTitle>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline" 
                          className={difficultyColors[problem.difficulty]}
                        >
                          <DifficultyIcon className="h-3 w-3 mr-1" />
                          {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          By {problem.createdBy?.name || 'System'}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/problems/${problem._id}`)}
                    >
                      Solve
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-3">
                    {formatDescription(problem.description)}
                  </p>
                  {problem.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {problem.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {!loading && pagination.total > 1 && (
        <div className="mt-8 flex justify-center space-x-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => handlePageChange(currentPage - 1)}
          >
            Previous
          </Button>
          
          {Array.from({ length: Math.min(5, pagination.total) }, (_, i) => {
            const page = Math.max(1, Math.min(pagination.total - 4, currentPage - 2)) + i;
            return (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </Button>
            );
          })}

          <Button
            variant="outline"
            disabled={currentPage === pagination.total}
            onClick={() => handlePageChange(currentPage + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
