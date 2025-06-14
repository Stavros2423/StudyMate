
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

const PostForm = ({ onPostCreated }: { onPostCreated?: () => void }) => {
  const { currentUser, userData, loading } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("PostForm: Starting submission process");
    console.log("PostForm: Current user:", currentUser?.uid);
    console.log("PostForm: User data:", userData);
    console.log("PostForm: Loading:", loading);
    
    // Validate user authentication
    if (!currentUser) {
      console.error("PostForm: No authenticated user");
      toast.error("Please log in to post a question");
      return;
    }

    // Validate form data
    if (!title.trim()) {
      toast.error("Please enter a question title");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter your question details");
      return;
    }

    // Don't wait for userData if user is authenticated - create fallback
    const authorData = userData || {
      displayName: currentUser.displayName || "Anonymous Student",
      username: `student_${currentUser.uid.slice(0, 8)}`
    };
    
    try {
      setIsSubmitting(true);
      console.log("PostForm: Creating post document with author data:", authorData);
      
      // Process tags
      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
      
      // Create post data object
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags: tagArray,
        authorId: currentUser.uid,
        authorName: authorData.displayName,
        authorUsername: authorData.username,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likeCount: 0,
        likedBy: [],
        replyCount: 0,
      };
      
      console.log("PostForm: Saving to Firebase:", postData);
      
      // Save to Firebase
      const docRef = await addDoc(collection(db, "posts"), postData);
      console.log("PostForm: Post saved successfully with ID:", docRef.id);
      
      // Show success message
      toast.success("Question posted successfully! 🎉");
      
      // Clear form
      setTitle("");
      setContent("");
      setTags("");
      
      // Trigger refresh
      if (onPostCreated) {
        console.log("PostForm: Triggering post created callback");
        onPostCreated();
      }
      
    } catch (error) {
      console.error("PostForm: Error saving post:", error);
      toast.error("Failed to post your question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show login prompt for unauthenticated users
  if (!currentUser) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <h3 className="text-lg font-semibold mb-2">Join the Community</h3>
          <p className="text-muted-foreground mb-4">Please log in to ask questions and help other students</p>
          <Button onClick={() => window.location.href = '/login'}>
            Log In to Post
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Show loading state only for initial auth loading
  if (loading && !currentUser) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  const displayName = userData?.displayName || currentUser.displayName || "Student";

  return (
    <Card className="mb-6">
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6 space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Ask a Question</h3>
            <span className="text-sm text-muted-foreground">
              Welcome, {displayName}!
            </span>
          </div>
          
          <div>
            <Input
              placeholder="What's your question? (e.g., How do I solve this math problem?)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
              className="text-lg font-medium"
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {title.length}/200 characters
            </p>
          </div>
          
          <div>
            <Textarea
              placeholder="Describe your question in detail. Include any relevant information that will help others understand and answer your question..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              required
              maxLength={2000}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/2000 characters
            </p>
          </div>
          
          <div>
            <Input
              placeholder="Tags (comma separated, e.g. math, physics, homework, calculus)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              maxLength={100}
              disabled={isSubmitting}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Add relevant tags to help others find your question
            </p>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Ask questions to get help from fellow students
          </p>
          <Button 
            type="submit" 
            disabled={isSubmitting || !title.trim() || !content.trim()}
            className="min-w-[120px]"
          >
            {isSubmitting ? "Posting..." : "Post Question"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PostForm;
