
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, Check } from "lucide-react";
import { toast } from "sonner";

export type Reply = {
  id: string;
  postId: string;
  content: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  createdAt: Date;
  likeCount: number;
  likedBy?: string[];
  bestAnswer?: boolean;
};

interface ReplyCardProps {
  reply: Reply;
  isPostAuthor?: boolean;
  onBestAnswerToggle?: () => void;
}

const ReplyCard = ({ reply, isPostAuthor = false, onBestAnswerToggle }: ReplyCardProps) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(reply.likedBy?.includes(currentUser?.uid || "") || false);
  const [likeCount, setLikeCount] = useState(reply.likeCount);
  
  const handleLike = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to like replies");
      return;
    }
    
    const replyRef = doc(db, "replies", reply.id);
    
    try {
      if (isLiked) {
        await updateDoc(replyRef, {
          likeCount: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        setLikeCount(prev => prev - 1);
      } else {
        await updateDoc(replyRef, {
          likeCount: increment(1),
          likedBy: arrayUnion(currentUser.uid)
        });
        setLikeCount(prev => prev + 1);
      }
      setIsLiked(!isLiked);
    } catch (error) {
      console.error("Error updating like status:", error);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleMarkBestAnswer = async () => {
    const replyRef = doc(db, "replies", reply.id);
    
    try {
      await updateDoc(replyRef, {
        bestAnswer: !reply.bestAnswer
      });
      toast.success(reply.bestAnswer ? "Best answer removed" : "Marked as best answer!");
      if (onBestAnswerToggle) {
        onBestAnswerToggle();
      }
    } catch (error) {
      console.error("Error updating best answer status:", error);
      toast.error("Failed to update best answer. Please try again.");
    }
  };
  
  return (
    <Card className={`mb-4 ${reply.bestAnswer ? 'border-green-500 bg-green-50 dark:bg-green-950/20' : ''}`}>
      <CardContent className="pt-6">
        {reply.bestAnswer && (
          <div className="flex items-center gap-2 mb-3 text-green-600 dark:text-green-400">
            <Check className="h-4 w-4" />
            <span className="text-sm font-medium">Best Answer</span>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-2">
          <div className="text-sm text-muted-foreground">
            <Link to={`/user/${reply.authorUsername}`} className="font-medium text-foreground hover:underline">
              {reply.authorName} (@{reply.authorUsername})
            </Link>{" "}
            · {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
          </div>
        </div>
        
        <div className="whitespace-pre-wrap">{reply.content}</div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          className={isLiked ? "text-primary" : ""}
        >
          <ThumbsUp className="mr-1 h-4 w-4" />
          {likeCount}
        </Button>

        {isPostAuthor && (
          <Button 
            variant={reply.bestAnswer ? "default" : "outline"} 
            size="sm" 
            onClick={handleMarkBestAnswer}
            className={reply.bestAnswer ? "bg-green-600 hover:bg-green-700" : ""}
          >
            <Check className="mr-1 h-4 w-4" />
            {reply.bestAnswer ? "Best Answer" : "Mark as Best"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReplyCard;
