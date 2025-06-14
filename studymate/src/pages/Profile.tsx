
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { db, storage } from "@/lib/firebase";
import { doc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { updateProfile } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import PostCard, { Post } from "@/components/posts/PostCard";
import { toast } from "sonner";

const Profile = () => {
  const { currentUser, userData, logOut } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoURL, setPhotoURL] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }
    
    if (userData) {
      setDisplayName(userData.displayName || "");
      setPhotoURL(userData.photoURL || "");
    }
    
    fetchUserPosts();
  }, [currentUser, userData]);
  
  const fetchUserPosts = async () => {
    if (!currentUser) return;
    
    try {
      const q = query(
        collection(db, "posts"),
        where("authorId", "==", currentUser.uid)
      );
      
      const querySnapshot = await getDocs(q);
      
      const fetchedPosts = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
        } as Post;
      });
      
      setUserPosts(fetchedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast.error("You must be logged in to update your profile");
      return;
    }

    if (!displayName.trim()) {
      toast.error("Display name is required");
      return;
    }
    
    try {
      setIsUpdating(true);
      console.log("Starting profile update...");
      
      let updatedPhotoURL = photoURL;
      
      // Upload new photo if selected
      if (photoFile) {
        console.log("Uploading new photo...");
        const storageRef = ref(storage, `profile_photos/${currentUser.uid}`);
        const uploadTask = uploadBytesResumable(storageRef, photoFile);
        
        await new Promise<void>((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              console.log('Upload is ' + progress + '% done');
            },
            (error) => {
              console.error("Photo upload error:", error);
              reject(error);
            },
            async () => {
              try {
                updatedPhotoURL = await getDownloadURL(uploadTask.snapshot.ref);
                console.log("Photo uploaded successfully:", updatedPhotoURL);
                resolve();
              } catch (error) {
                console.error("Error getting download URL:", error);
                reject(error);
              }
            }
          );
        });
      }
      
      // Update Firebase Auth profile
      console.log("Updating Firebase Auth profile...");
      await updateProfile(currentUser, {
        displayName: displayName.trim(),
        photoURL: updatedPhotoURL
      });
      
      // Update Firestore user document
      console.log("Updating Firestore user document...");
      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        photoURL: updatedPhotoURL,
        updatedAt: new Date()
      });
      
      console.log("Profile updated successfully");
      toast.success("Profile updated successfully!");
      setPhotoURL(updatedPhotoURL);
      setPhotoFile(null);
      setPhotoPreview("");
      
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };
  
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
      
      <Tabs defaultValue="profile">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile Information</TabsTrigger>
          <TabsTrigger value="posts">Your Questions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your profile details and photo
                </CardDescription>
              </CardHeader>
              
              <form onSubmit={handleProfileUpdate}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Full Name *</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={currentUser?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={userData?.username || "Loading..."}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="photo">Profile Photo</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                    {photoFile && (
                      <p className="text-sm text-muted-foreground">
                        New photo selected: {photoFile.name}
                      </p>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button" onClick={() => logOut()}>
                    Sign Out
                  </Button>
                  <Button type="submit" disabled={isUpdating || !displayName.trim()}>
                    {isUpdating ? "Updating..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>
                  This is how others will see you
                </CardDescription>
              </CardHeader>
              
              <CardContent className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  <AvatarImage
                    src={photoPreview || photoURL || ""}
                    alt={displayName}
                  />
                  <AvatarFallback className="text-2xl">
                    {getInitials(displayName || userData?.displayName || "U")}
                  </AvatarFallback>
                </Avatar>
                
                <div className="text-center">
                  <h3 className="text-xl font-medium">
                    {displayName || userData?.displayName || "Your Name"}
                  </h3>
                  <p className="text-muted-foreground">
                    @{userData?.username || "username"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="posts">
          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
              <div className="h-24 bg-muted rounded"></div>
            </div>
          ) : userPosts.length > 0 ? (
            <div className="space-y-4">
              {userPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-center text-muted-foreground">
                  You haven't posted any questions yet
                </CardTitle>
                <CardDescription className="text-center">
                  Ask your first question on the homepage
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
