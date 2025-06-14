
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { db } from "@/lib/firebase";
import { doc, updateDoc, increment, arrayUnion, arrayRemove } from "firebase/firestore";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export type Post = {
  id: string;
  title: string;
  content: string;
  tags: string[];
  authorId: string;
  authorName: string;
  authorUsername: string;
  createdAt: Date;
  likeCount: number;
  likedBy?: string[];
  replyCount: number;
};

interface PostCardProps {
  post: Post;
  showFullContent?: boolean;
}

const PostCard = ({ post, showFullContent = false }: PostCardProps) => {
  const { currentUser } = useAuth();
  const [isLiked, setIsLiked] = useState(post.likedBy?.includes(currentUser?.uid || "") || false);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  
  const handleLike = async () => {
    if (!currentUser) {
      toast.error("You must be logged in to like posts");
      return;
    }
    
    const postRef = doc(db, "posts", post.id);
    
    try {
      if (isLiked) {
        await updateDoc(postRef, {
          likeCount: increment(-1),
          likedBy: arrayRemove(currentUser.uid)
        });
        setLikeCount(prev => prev - 1);
      } else {
        await updateDoc(postRef, {
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
  
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + "/post/" + post.id);
    toast.success("Link copied to clipboard");
  };
  
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <Link to={`/post/${post.id}`} className="text-lg font-medium hover:underline">
              {post.title}
            </Link>
            <div className="text-sm text-muted-foreground">
              Posted by{" "}
              <Link to={`/user/${post.authorUsername}`} className="hover:underline">
                {post.authorName} (@{post.authorUsername})
              </Link>{" "}
              · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {showFullContent ? (
          <div className="whitespace-pre-wrap">{post.content}</div>
        ) : (
          <div className="line-clamp-3 whitespace-pre-wrap">{post.content}</div>
        )}
        
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleLike}
          className={isLiked ? "text-primary" : ""}
        >
          <ThumbsUp className="mr-1 h-4 w-4" />
          {likeCount}
        </Button>
        
        <Link to={`/post/${post.id}`}>
          <Button variant="ghost" size="sm">
            <MessageSquare className="mr-1 h-4 w-4" />
            {post.replyCount}
          </Button>
        </Link>
        
        <Button variant="ghost" size="sm" onClick={handleShare}>
          <Share2 className="mr-1 h-4 w-4" />
          Share
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostCard;
