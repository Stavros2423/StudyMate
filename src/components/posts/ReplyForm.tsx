
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, doc, updateDoc, increment } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";

interface ReplyFormProps {
  postId: string;
  onReplyCreated?: () => void;
}

const ReplyForm = ({ postId, onReplyCreated }: ReplyFormProps) => {
  const { currentUser, userData } = useAuth();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log("ReplyForm: handleSubmit called for postId:", postId);
    console.log("ReplyForm: currentUser:", currentUser?.uid);
    console.log("ReplyForm: userData:", userData);
    
    if (!currentUser) {
      toast.error("You must be logged in to reply");
      return;
    }

    if (!content.trim()) {
      toast.error("Please write a reply before submitting");
      return;
    }
    
    // Use fallback data if userData is not available
    const authorData = userData || {
      displayName: currentUser.displayName || "Anonymous Student",
      username: `student_${currentUser.uid.slice(0, 8)}`
    };
    
    try {
      setIsSubmitting(true);
      console.log("ReplyForm: Creating reply with data:", {
        postId,
        content,
        authorId: currentUser.uid,
        authorName: authorData.displayName,
        authorUsername: authorData.username
      });
      
      const replyData = {
        postId,
        content: content.trim(),
        authorId: currentUser.uid,
        authorName: authorData.displayName || "Anonymous",
        authorUsername: authorData.username || "unknown",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        likeCount: 0,
        likedBy: [],
        bestAnswer: false,
      };
      
      console.log("ReplyForm: Saving reply to Firebase...");
      const docRef = await addDoc(collection(db, "replies"), replyData);
      console.log("ReplyForm: Reply saved to Firebase with ID:", docRef.id);
      
      console.log("ReplyForm: Updating post reply count...");
      const postRef = doc(db, "posts", postId);
      await updateDoc(postRef, {
        replyCount: increment(1)
      });
      console.log("ReplyForm: Post reply count updated");
      
      toast.success("Reply posted successfully!");
      setContent("");
      
      if (onReplyCreated) {
        console.log("ReplyForm: Calling onReplyCreated callback");
        onReplyCreated();
      }
    } catch (error) {
      console.error("ReplyForm: Error creating reply:", error);
      toast.error("Failed to post reply. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-muted-foreground">Please log in to reply</p>
          <Button 
            className="mt-2" 
            onClick={() => window.location.href = '/login'}
          >
            Log In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <form onSubmit={handleSubmit}>
        <CardContent className="pt-6">
          <div className="mb-4">
            <h4 className="font-medium mb-2">Write a Reply</h4>
            <p className="text-sm text-muted-foreground">
              Help your fellow students by sharing your knowledge!
            </p>
          </div>
          <Textarea
            placeholder="Write your reply here... Be helpful and respectful."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={4}
            required
            disabled={isSubmitting}
            maxLength={2000}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {content.length}/2000 characters
          </p>
        </CardContent>
        
        <CardFooter className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Logged in as: {userData?.displayName || currentUser.displayName || "Anonymous"}
          </p>
          <Button 
            type="submit" 
            disabled={isSubmitting || !content.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ReplyForm;
