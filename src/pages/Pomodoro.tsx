
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RefreshCw } from "lucide-react";
import { useQuotes } from "@/hooks/useQuotes";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

const defaultTimes = {
  pomodoro: 25 * 60, // 25 minutes
  shortBreak: 5 * 60, // 5 minutes
  longBreak: 15 * 60, // 15 minutes
};

const Pomodoro = () => {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(defaultTimes[mode]);
  const [isActive, setIsActive] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const { quote, author } = useQuotes(2); // Change quote every 2 minutes

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      // Timer completed
      setIsActive(false);

      if (mode === "pomodoro") {
        setCompletedPomodoros(prev => prev + 1);

        // After 4 pomodoros, suggest a long break
        if ((completedPomodoros + 1) % 4 === 0) {
          setMode("longBreak");
        } else {
          setMode("shortBreak");
        }
      } else {
        // After break, back to pomodoro
        setMode("pomodoro");
      }
      
      const audio = new Audio("/notification.mp3");
      audio.play().catch(e => console.log("Audio play failed:", e));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, mode, completedPomodoros]);

  // Update timer when mode changes
  useEffect(() => {
    setTimeLeft(defaultTimes[mode]);
    setIsActive(false);
  }, [mode]);

  const toggleTimer = () => {
    setIsActive((prev) => !prev);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(defaultTimes[mode]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Pomodoro Timer</CardTitle>
          <CardDescription className="text-center">
            Stay focused and productive with timed work sessions
          </CardDescription>
        </CardHeader>

        <Tabs value={mode} onValueChange={(v) => setMode(v as TimerMode)} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
            <TabsTrigger value="shortBreak">Short Break</TabsTrigger>
            <TabsTrigger value="longBreak">Long Break</TabsTrigger>
          </TabsList>
        </Tabs>

        <CardContent className="pt-6 flex flex-col items-center">
          <div className="text-6xl font-bold mb-8">
            {formatTime(timeLeft)}
          </div>

          <div className="flex gap-4">
            <Button onClick={toggleTimer} size="lg">
              {isActive ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button variant="outline" onClick={resetTimer} size="lg">
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="mt-8 text-center border-t pt-4 italic text-muted-foreground">
            <p>"{quote}"</p>
            <p className="text-sm mt-1">— {author}</p>
          </div>

          <div className="mt-4 text-sm">
            Completed Pomodoros: {completedPomodoros}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Pomodoro;
