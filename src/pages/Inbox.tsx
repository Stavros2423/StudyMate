
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, Tag, Award, Bell, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const Inbox = () => {
  const { currentUser } = useAuth();
  const { notifications, loading, refetch } = useNotifications();
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refreshing notifications
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refetch();
      toast.success("Notifications refreshed");
    } catch (error) {
      console.error("Error refreshing notifications:", error);
      toast.error("Failed to refresh notifications");
    } finally {
      setIsRefreshing(false);
    }
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "reply":
        return <MessageCircle className="h-5 w-5" />;
      case "tag":
        return <Tag className="h-5 w-5" />;
      case "points":
        return <Award className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  const markAllAsRead = async () => {
    if (!currentUser) return;
    
    try {
      setIsMarkingRead(true);
      
      const promises = notifications
        .filter(n => !n.read)
        .map(notification => {
          const notificationRef = doc(db, "notifications", notification.id);
          return updateDoc(notificationRef, {
            read: true
          });
        });
      
      await Promise.all(promises);
      await refetch(); // Refresh notifications after marking as read
      toast.success("All notifications marked as read");
    } catch (error) {
      console.error("Error marking notifications as read:", error);
      toast.error("Failed to mark notifications as read");
    } finally {
      setIsMarkingRead(false);
    }
  };
  
  const markAsRead = async (notification: Notification) => {
    if (notification.read) return;
    
    try {
      const notificationRef = doc(db, "notifications", notification.id);
      await updateDoc(notificationRef, {
        read: true
      });
      await refetch(); // Refresh after marking as read
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark as read");
    }
  };
  
  // Effect to automatically fetch notifications when component mounts
  useEffect(() => {
    if (currentUser) {
      refetch();
    }
  }, [currentUser, refetch]);
  
  if (!currentUser) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your inbox</h2>
        <p className="mb-6">You need to be logged in to access your notifications.</p>
        <Link to="/login">
          <Button>Login</Button>
        </Link>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Inbox</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
          <div className="h-16 bg-muted rounded"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Inbox</h1>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {notifications.some(n => !n.read) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={isMarkingRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
      </div>
      
      {notifications.length > 0 ? (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={`${notification.read ? "bg-background" : "bg-accent"} transition-colors card-hover`}
            >
              <Link 
                to={notification.postId ? `/post/${notification.postId}` : "#"} 
                onClick={() => markAsRead(notification)}
                className="block"
              >
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="bg-muted p-2 rounded-full">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`${notification.read ? "" : "font-medium"}`}>
                      {notification.message}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  
                  {!notification.read && (
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </CardContent>
              </Link>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-muted-foreground">No notifications yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center pb-6">
            <p className="text-muted-foreground">
              When you have new replies or mentions, they'll appear here
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Inbox;
