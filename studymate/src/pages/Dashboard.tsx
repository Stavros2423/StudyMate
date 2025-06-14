
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { BookOpen, Clock, Coffee, HelpCircle, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

type StudyStats = {
  totalStudyMinutes: number;
  totalBreakMinutes: number;
  totalQuestions: number;
  lastUpdated: Date | null;
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState<StudyStats>({
    totalStudyMinutes: 0,
    totalBreakMinutes: 0,
    totalQuestions: 0,
    lastUpdated: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudyStats = async () => {
      if (!currentUser) {
        setLoading(false);
        return;
      }

      try {
        // Fetch study sessions
        const sessionsQuery = query(
          collection(db, "studySessions"),
          where("userId", "==", currentUser.uid)
        );
        const sessionsSnapshot = await getDocs(sessionsQuery);
        
        // Calculate study stats
        let studyMinutes = 0;
        let breakMinutes = 0;
        
        sessionsSnapshot.forEach((doc) => {
          const session = doc.data();
          studyMinutes += session.studyMinutes || 0;
          breakMinutes += session.breakMinutes || 0;
        });
        
        // Fetch questions asked
        const questionsQuery = query(
          collection(db, "posts"),
          where("userId", "==", currentUser.uid)
        );
        const questionsSnapshot = await getDocs(questionsQuery);
        
        setStats({
          totalStudyMinutes: studyMinutes,
          totalBreakMinutes: breakMinutes,
          totalQuestions: questionsSnapshot.size,
          lastUpdated: new Date(),
        });
      } catch (error) {
        console.error("Error fetching study stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudyStats();
  }, [currentUser]);

  // Animation for cards
  useEffect(() => {
    if (!loading) {
      const cards = document.querySelectorAll('.stat-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-scale-in');
          card.classList.remove('opacity-0');
        }, index * 150);
      });
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse flex flex-col gap-4 w-full">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-40 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-60 bg-muted rounded mt-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
          Your Study Dashboard
        </h1>
        
        <div className="flex gap-3">
          <Link to="/timer">
            <Button variant="outline" size="sm" className="button-hover">
              Start Studying
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/ai-chat">
            <Button size="sm" className="button-hover">
              Ask AI Helper
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="stat-card opacity-0 border-t-4 border-t-blue-500 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Clock className="mr-2 h-5 w-5 text-blue-500" />
              Study Time
            </CardTitle>
            <CardDescription>Total minutes studied</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalStudyMinutes}</div>
            <p className="text-sm text-muted-foreground">
              That's {Math.floor(stats.totalStudyMinutes / 60)} hours and {stats.totalStudyMinutes % 60} minutes
            </p>
          </CardContent>
        </Card>
        
        <Card className="stat-card opacity-0 border-t-4 border-t-green-500 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Coffee className="mr-2 h-5 w-5 text-green-500" />
              Break Time
            </CardTitle>
            <CardDescription>Total break minutes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBreakMinutes}</div>
            <p className="text-sm text-muted-foreground">
              {(stats.totalStudyMinutes > 0 ? Math.round((stats.totalBreakMinutes / stats.totalStudyMinutes) * 100) : 0)}% study/break ratio
            </p>
          </CardContent>
        </Card>
        
        <Card className="stat-card opacity-0 border-t-4 border-t-purple-500 shadow-md hover:shadow-lg transition-all duration-300">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <HelpCircle className="mr-2 h-5 w-5 text-purple-500" />
              Questions
            </CardTitle>
            <CardDescription>Questions asked</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalQuestions}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="stat-card opacity-0 shadow-md hover:shadow-lg transition-all duration-300">
        <CardHeader>
          <CardTitle className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6 text-primary" />
            Weekly Progress
          </CardTitle>
          <CardDescription>Your study time over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-10 flex flex-col items-center justify-center">
            <p className="text-center text-muted-foreground mb-6">
              Start using the Pomodoro timer to track your study sessions and see your weekly progress here!
            </p>
            <Link to="/timer">
              <Button className="button-hover">
                Start Pomodoro Timer
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground italic">
        {stats.lastUpdated ? 
          `Last updated: ${stats.lastUpdated.toLocaleString()}` : 
          "No data available yet. Start using StudyMate features to see your stats!"
        }
      </p>
    </div>
  );
};

export default Dashboard;
