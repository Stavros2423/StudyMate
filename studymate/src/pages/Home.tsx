
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BookOpen, Clock, MessageSquare, Users, ChevronRight, Sparkles, ArrowRight, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Home = () => {
  const { currentUser } = useAuth();

  useEffect(() => {
    // Add animation class to elements when component mounts
    const elements = document.querySelectorAll('.animate-on-mount');
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add('animate-fade-in');
        el.classList.remove('opacity-0');
      }, index * 150); // Faster staggered animation
    });
  }, []);

  return (
    <div className="flex flex-col items-center min-h-screen">
      {/* Hero Section with purple gradient background */}
      <section className="w-full py-16 text-center relative overflow-hidden purple-gradient">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-on-mount opacity-0">
            Welcome to <span className="mirror-text">StudyMate</span>
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto text-foreground/80 animate-on-mount opacity-0">
            The ultimate <span className="mirror-text">student collaboration</span> platform for academic success
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-on-mount opacity-0">
            {currentUser ? (
              <Link to="/feed">
                <Button size="lg" className="group bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg shadow-purple-600/30">
                  Explore Your Feed
                  <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="lg" className="transition-all duration-300 border-purple-300/30 shadow-lg">
                    Log In
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button size="lg" className="group bg-purple-600 hover:bg-purple-700 transition-all duration-300 shadow-lg shadow-purple-600/30">
                    Join Now
                    <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {}
      <section className="w-full py-14 bg-accent/30">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 animate-on-mount opacity-0">
            Everything You Need to <span className="mirror-text">Excel in Your Studies</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="bg-card p-6 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 animate-on-mount opacity-0">
              <BookOpen className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Student Forum</h3>
              <p className="text-foreground/70 mb-4">Connect with classmates, ask questions, and share knowledge</p>
              <Link to="/feed" className="text-primary flex items-center hover:underline">
                Browse Forum <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 animate-on-mount opacity-0">
              <Clock className="h-10 w-10 text-purple-400 mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold mb-3">Study Timer</h3>
              <p className="text-foreground/70 mb-4">Track your study sessions with our <span className="mirror-text">Pomodoro timer</span></p>
              <Link to="/timer" className="text-primary flex items-center hover:underline">
                Start Timer <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border shadow-lg hover:shadow-xl transition-all duration-300 animate-on-mount opacity-0">
              <MessageSquare className="h-10 w-10 text-purple-400 mb-4" />
              <h3 className="text-xl font-semibold mb-3">Log In / Sign up !</h3>
              <p className="text-foreground/70 mb-4"> <span className="mirror-text"></span></p>
               <Link to="/login" className="text-primary flex items-center hover:underline">
                Log In <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full py-14 bg-background">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 animate-on-mount opacity-0">
            How <span className="mirror-text">StudyMate</span> Works
          </h2>

          <div className="space-y-8 mt-10">
            <div className="flex flex-col md:flex-row items-center gap-6 animate-on-mount opacity-0">
              <div className="bg-purple-600/10 rounded-full p-4 flex-shrink-0">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">1</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Create an Account</h3>
                <p className="text-foreground/70">Sign up in seconds with your email address and create your student profile</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 animate-on-mount opacity-0">
              <div className="bg-purple-600/10 rounded-full p-4 flex-shrink-0">
                <div className="bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold">2</div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Join the Community</h3>
                <p className="text-foreground/70">Browse the forum, ask questions, and help others with their questions</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-16 text-center animate-on-mount opacity-0 purple-gradient">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to <span className="mirror-text">Suceed?</span></h2>
          <p className="text-xl mb-8 text-foreground/80">
            Join now
          </p>

          {!currentUser && (
            <Link to="/signup">
              <Button size="lg" className="group bg-gradient-to-r from-purple-500 to-purple-800 hover:from-purple-600 hover:to-purple-900 transition-all duration-300 shadow-lg shadow-purple-600/30">
                Get Started Now
                <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
