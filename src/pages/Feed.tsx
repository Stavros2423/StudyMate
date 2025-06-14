
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { collection, query, orderBy, limit, getDocs, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PostForm from "@/components/posts/PostForm";
import PostCard, { Post } from "@/components/posts/PostCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RefreshCw } from "lucide-react";

const Feed = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [lastVisible, setLastVisible] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [activeTab, setActiveTab] = useState("latest");
  
  const fetchPosts = async (tabValue: string, reset = false) => {
    if (reset) {
      setLoading(true);
    }
    
    try {
      console.log("Feed: Fetching posts for tab:", tabValue, "reset:", reset);
      let q;
      const postsPerPage = 10;
      
      if (tabValue === "latest") {
        q = reset
          ? query(collection(db, "posts"), orderBy("createdAt", "desc"), limit(postsPerPage))
          : query(collection(db, "posts"), orderBy("createdAt", "desc"), startAfter(lastVisible), limit(postsPerPage));
      } else {
        q = reset
          ? query(collection(db, "posts"), orderBy("likeCount", "desc"), limit(postsPerPage))
          : query(collection(db, "posts"), orderBy("likeCount", "desc"), startAfter(lastVisible), limit(postsPerPage));
      }
      
      const querySnapshot = await getDocs(q);
      console.log("Feed: Query snapshot size:", querySnapshot.size);
      
      if (querySnapshot.empty) {
        setHasMore(false);
        if (reset) {
          setPosts([]);
        }
        return;
      }
      
      setLastVisible(querySnapshot.docs[querySnapshot.docs.length - 1]);
      
      const fetchedPosts = querySnapshot.docs.map(doc => {
        const data = doc.data() as DocumentData;
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Post;
      });
      
      console.log("Feed: Fetched posts:", fetchedPosts.length);
      
      if (reset) {
        setPosts(fetchedPosts);
      } else {
        setPosts(prev => [...prev, ...fetchedPosts]);
      }
      
      setHasMore(querySnapshot.docs.length >= postsPerPage);
    } catch (error) {
      console.error("Feed: Error fetching posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchPosts(activeTab, true);
  }, [activeTab]);
  
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setLastVisible(null);
    setHasMore(true);
  };
  
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      fetchPosts(activeTab);
    }
  };

  const handlePostCreated = async () => {
    console.log("Feed: Post created, refreshing feed");
    setRefreshing(true);
    
    // Refresh user data and posts
    await Promise.all([
      refreshUserData(),
      fetchPosts(activeTab, true)
    ]);
    
    // Reset pagination
    setLastVisible(null);
    setHasMore(true);
  };

  const handleRefresh = async () => {
    console.log("Feed: Manual refresh triggered");
    setRefreshing(true);
    await fetchPosts(activeTab, true);
    setLastVisible(null);
    setHasMore(true);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Student Forum</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <PostForm onPostCreated={handlePostCreated} />
      
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="latest">Latest Questions</TabsTrigger>
          <TabsTrigger value="popular">Popular Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="latest">
          {loading && posts.length === 0 ? (
            <div className="text-center py-10">
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
              <p className="text-muted-foreground mt-4">Loading questions...</p>
            </div>
          ) : posts.length > 0 ? (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No questions yet. Be the first to ask!</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="popular">
          {loading && posts.length === 0 ? (
            <div className="text-center py-10">
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
              <p className="text-muted-foreground mt-4">Loading popular questions...</p>
            </div>
          ) : posts.length > 0 ? (
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-muted-foreground">No popular questions yet.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {hasMore && (
        <div className="text-center mt-4 mb-8">
          <Button 
            variant="outline" 
            onClick={handleLoadMore} 
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Feed;
