
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import PostCard, { Post } from "@/components/posts/PostCard";
import ReplyForm from "@/components/posts/ReplyForm";
import ReplyCard, { Reply } from "@/components/posts/ReplyCard";
import { toast } from "sonner";

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentUser, refreshUserData } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  
  const fetchPost = async () => {
    if (!id) return;
    
    try {
      console.log("PostDetail: Fetching post:", id);
      const postDoc = await getDoc(doc(db, "posts", id));
      
      if (postDoc.exists()) {
        const postData = postDoc.data();
        console.log("PostDetail: Raw post data from Firebase:", postData);
        setPost({
          id: postDoc.id,
          ...postData,
          createdAt: postData.createdAt?.toDate() || new Date(),
        } as Post);
        console.log("PostDetail: Post loaded successfully");
      } else {
        console.log("PostDetail: Post not found in Firebase");
        toast.error("Post not found");
        navigate("/feed");
      }
    } catch (error) {
      console.error("PostDetail: Error fetching post from Firebase:", error);
      toast.error("Error loading post. Please try again.");
    }
  };
  
  const fetchReplies = async () => {
    if (!id) return;
    
    try {
      console.log("PostDetail: Fetching replies for post:", id);
      
      const simpleQuery = query(
        collection(db, "replies"),
        where("postId", "==", id)
      );
      
      const querySnapshot = await getDocs(simpleQuery);
      console.log("PostDetail: Found", querySnapshot.size, "replies in Firebase");
      
      if (querySnapshot.empty) {
        console.log("PostDetail: No replies found in Firebase for postId:", id);
        setReplies([]);
        setLoading(false);
        return;
      }
      
      const fetchedReplies = querySnapshot.docs.map(doc => {
        const data = doc.data();
        console.log("PostDetail: Reply data from Firebase:", data);
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          bestAnswer: data.bestAnswer || false,
        } as Reply;
      });
      
      // Sort replies: best answers first, then by creation date (newest first)
      fetchedReplies.sort((a, b) => {
        if (a.bestAnswer && !b.bestAnswer) return -1;
        if (!a.bestAnswer && b.bestAnswer) return 1;
        return b.createdAt.getTime() - a.createdAt.getTime();
      });
      
      console.log("PostDetail: Processed replies:", fetchedReplies);
      setReplies(fetchedReplies);
    } catch (error) {
      console.error("PostDetail: Error fetching replies from Firebase:", error);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    console.log("PostDetail: Component mounted, fetching data for post:", id);
    fetchPost();
    fetchReplies();
  }, [id]);
  
  const handleReplyCreated = async () => {
    console.log("PostDetail: Reply created, refreshing data");
    await refreshUserData();
    await fetchReplies();
    await fetchPost();
  };

  const handleBestAnswerToggle = async () => {
    await fetchReplies();
  };
  
  if (loading && !post) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-3/4"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
          <div className="h-24 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const isPostAuthor = currentUser && post && currentUser.uid === post.authorId;
  
  return (
    <div className="max-w-3xl mx-auto">
      <Button 
        variant="ghost" 
        onClick={() => navigate(-1)} 
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      
      {post && <PostCard post={post} showFullContent />}
      
      <div className="mt-8 mb-4">
        <h2 className="text-xl font-bold">
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h2>
        {loading && <p className="text-sm text-muted-foreground">Loading replies...</p>}
      </div>
      
      {currentUser && (
        <div className="mb-8">
          <ReplyForm postId={id || ""} onReplyCreated={handleReplyCreated} />
        </div>
      )}
      
      {/* Debug info */}
      <div className="mb-4 p-4 bg-muted rounded-lg text-sm">
        <p><strong>Debug Info:</strong></p>
        <p>Post ID: {id}</p>
        <p>Replies found: {replies.length}</p>
        <p>Loading: {loading.toString()}</p>
        <p>Current User: {currentUser ? 'Logged in' : 'Not logged in'}</p>
        <p>Is Post Author: {isPostAuthor ? 'Yes' : 'No'}</p>
      </div>
      
      {replies.length > 0 ? (
        <div className="space-y-4">
          {replies.map((reply, index) => (
            <div key={reply.id}>
              <p className="text-xs text-muted-foreground mb-2">
                Reply #{index + 1} {reply.bestAnswer && '(Best Answer)'}
              </p>
              <ReplyCard 
                reply={reply} 
                isPostAuthor={isPostAuthor} 
                onBestAnswerToggle={handleBestAnswerToggle}
              />
            </div>
          ))}
        </div>
      ) : !loading ? (
        <div className="text-center py-10 border rounded-lg">
          <p className="text-muted-foreground">No replies yet. Be the first to respond!</p>
          <p className="text-xs text-muted-foreground mt-2">
            {currentUser ? "Write a reply above to start the discussion." : "Please log in to reply."}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default PostDetail;
