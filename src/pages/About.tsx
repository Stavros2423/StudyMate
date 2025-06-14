
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, BookOpen, Award, Mail } from "lucide-react";

const About = () => {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">About <span className="mirror-text"> </span></h1>
      <h1 className="text-3xl font-bold mb-2">About <span className="mirror-text">StudyMate</span></h1>
      <p className="text-muted-foreground mb-6">Where students connect, learn and grow together</p>

      <div className="space-y-8">
        <Card className="border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader>
            <CardTitle><span className="mirror-text">Our Mission</span></CardTitle>
            <CardDescription>
              Empowering students through collaborative learning
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              StudyMate is a platform designed to help students connect, collaborate, and learn from each other. We believe in the <span className="mirror-text">power of community</span>-driven education, where asking questions and helping others leads to better understanding and academic success.
            </p>
            <p>
              Our unique points-based system encourages students to contribute to the community by helping their peers. The more you help others, the more points you earn, which can be used to ask your own questions.
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader>
            <CardTitle><span className="mirror-text">How It Works</span></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Join the Community</h3>
                  <p className="text-sm text-muted-foreground">
                    Create an account to become part of our student community
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Answer Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Help others by answering their questions
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <Award className="h-5 w-5 text-primary animate-pulse" />
                </div>
                <div>
                  <h3 className="font-medium"><span className="mirror-text">Earn Points</span></h3>
                  <p className="text-sm text-muted-foreground">
                    Build your reputation with help points as others value your answers
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="bg-primary/10 p-2 rounded-full h-fit">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">Ask Questions</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your earned points to ask questions when you need help
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-500/20 shadow-lg shadow-purple-500/10">
          <CardHeader>
            <CardTitle>Contact the <span className="mirror-text">Creator</span></CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              StudyMate was created by Stavro Kolovo,student.
            </p>
            <p>
              If you have questions, feedback, or suggestions, please don't hesitate to reach out.
            </p>
            <a href="mailto:infostudymate25@gmail.com">
                  <Button className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-800 hover:from-purple-700 hover:to-purple-900">
                    <Mail className="h-4 w-4" />
                    Contact Creator
                  </Button>
           </a>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default About;
