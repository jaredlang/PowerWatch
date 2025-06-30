import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Facebook,
  Twitter,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import LocationPicker from "./LocationPicker";
import PhotoUploader from "./PhotoUploader";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface ReportFormProps {
  onSubmit?: (data: ReportData) => void;
  onCancel?: () => void;
  initialData?: Partial<ReportData & { id: string }>;
  mode?: "create" | "edit";
}

export interface ReportData {
  title: string;
  description: string;
  severity: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  photos: File[];
}

const ReportForm = ({
  onSubmit = () => {},
  onCancel = () => {},
  initialData,
  mode = "create",
}: ReportFormProps) => {
  const { user, session } = useAuth();
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<ReportData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    severity: initialData?.severity || "medium",
    location: initialData?.location || {
      latitude: 40.7128,
      longitude: -74.006,
      address: "New York, NY, USA",
    },
    photos: [],
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [reportId, setReportId] = useState<string>("");
  const [postToFacebook, setPostToFacebook] = useState<boolean>(false);
  const [postToTwitter, setPostToTwitter] = useState<boolean>(false);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Check if user logged in via Facebook or Twitter
  const isLoggedInViaFacebook =
    session?.user?.app_metadata?.provider === "facebook";
  const isLoggedInViaTwitter =
    session?.user?.app_metadata?.provider === "twitter";

  const postReportToFacebook = async (
    reportData: ReportData,
    reportId: string,
  ) => {
    try {
      // This would typically require Facebook Graph API integration
      // For now, we'll simulate the posting
      const message = `🚨 Electrical Infrastructure Issue Reported\n\nTitle: ${reportData.title}\nSeverity: ${reportData.severity.toUpperCase()}\nLocation: ${reportData.location.address}\n\nReport ID: ${reportId}\n\n#ElectricalSafety #InfrastructureReport`;

      // In a real implementation, you would use Facebook Graph API:
      // const response = await fetch(`https://graph.facebook.com/me/feed`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${session?.provider_token}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     message: message,
      //   }),
      // });

      console.log("Would post to Facebook:", message);
      // For demo purposes, we'll just show a success message
      return true;
    } catch (error) {
      console.error("Error posting to Facebook:", error);
      return false;
    }
  };

  const postReportToTwitter = async (
    reportData: ReportData,
    reportId: string,
  ) => {
    try {
      const tweet = `🚨 Electrical Infrastructure Issue Reported\n\nTitle: ${reportData.title}\nSeverity: ${reportData.severity.toUpperCase()}\nLocation: ${reportData.location.address}\n\nReport ID: ${reportId}\n\n#ElectricalSafety #InfrastructureReport`;

      // Get the provider token from the session
      const providerToken = session?.provider_token;
      const providerRefreshToken = session?.provider_refresh_token;

      console.log("Twitter auth debug:", {
        hasProviderToken: !!providerToken,
        hasRefreshToken: !!providerRefreshToken,
        provider: session?.user?.app_metadata?.provider,
        tokenLength: providerToken?.length,
      });

      if (!providerToken) {
        throw new Error(
          "No Twitter access token available. Please log out and log back in with Twitter.",
        );
      }

      // Use Supabase Edge Function to post to Twitter (avoids CORS issues)
      const { data, error } = await supabase.functions.invoke(
        "supabase-functions-post-to-twitter",
        {
          body: {
            tweet,
            providerToken,
          },
        },
      );

      if (error) {
        throw new Error(`Edge function error: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to post to Twitter");
      }

      console.log("Successfully posted to Twitter:", data.data);
      return true;
    } catch (error) {
      console.error("Error posting to Twitter:", error);
      // Don't throw the error to prevent blocking the main report submission
      return false;
    }
  };

  const handleNext = () => {
    if (step === 1 && !formData.location) {
      setError("Please select a location");
      return;
    }

    if (step === 2 && (!formData.title || !formData.description)) {
      setError("Please provide both a title and description of the issue");
      return;
    }

    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
    setError("");
  };

  const uploadPhotos = async (photos: File[]): Promise<string[]> => {
    const uploadPromises = photos.map(async (photo, index) => {
      const fileExt = photo.name.split(".").pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;
      const filePath = `reports/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("report-images")
        .upload(filePath, photo);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from("report-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Upload photos if any are provided
      const imageUrls =
        formData.photos.length > 0 ? await uploadPhotos(formData.photos) : [];

      let data;
      if (mode === "edit" && initialData?.id) {
        // Update existing report
        const updateData: any = {
          title: formData.title,
          description: formData.description,
          severity: formData.severity,
          location_latitude: formData.location.latitude,
          location_longitude: formData.location.longitude,
          location_address: formData.location.address,
          updated_at: new Date().toISOString(),
        };

        // Only update image_urls if new photos were uploaded
        if (imageUrls.length > 0) {
          updateData.image_urls = imageUrls;
        }

        const { data: updateResult, error } = await supabase
          .from("reports")
          .update(updateData)
          .eq("id", initialData.id)
          .select()
          .single();

        if (error) {
          throw error;
        }
        data = updateResult;
      } else {
        // Insert new report
        const { data: insertResult, error } = await supabase
          .from("reports")
          .insert({
            title: formData.title,
            description: formData.description,
            severity: formData.severity,
            location_latitude: formData.location.latitude,
            location_longitude: formData.location.longitude,
            location_address: formData.location.address,
            image_urls: imageUrls,
            status: "pending",
            user_id: user?.id,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }
        data = insertResult;
      }

      setReportId(data.id);

      // Post to Facebook if option is enabled
      if (postToFacebook && isLoggedInViaFacebook) {
        await postReportToFacebook(formData, data.id);
      }

      // Post to Twitter if option is enabled
      if (postToTwitter && isLoggedInViaTwitter) {
        await postReportToTwitter(formData, data.id);
      }

      onSubmit(formData);

      // Reset form after successful submission
      setFormData({
        title: "",
        description: "",
        severity: "medium",
        location: {
          latitude: 40.7128,
          longitude: -74.006,
          address: "New York, NY, USA",
        },
        photos: [],
      });
      setPostToFacebook(false);
      setPostToTwitter(false);
      setStep(4); // Success step
    } catch (err: any) {
      console.error("Error submitting report:", err);
      setError(err.message || "Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLocationChange = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setFormData({ ...formData, location });
  };

  const handlePhotosChange = (photos: File[]) => {
    setFormData({ ...formData, photos });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto bg-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {step === 1 && "Select Location"}
          {step === 2 && "Describe the Issue"}
          {step === 3 && "Add Photos"}
          {step === 4 &&
            (mode === "edit" ? "Report Updated" : "Report Submitted")}
        </CardTitle>
        <Progress value={progress} className="h-2 mt-2" />
      </CardHeader>

      <CardContent className="px-6 py-4">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Please select the location of the electrical infrastructure issue.
            </p>
            <LocationPicker
              initialLocation={formData.location}
              onLocationChange={handleLocationChange}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Brief summary of the issue..."
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the electrical issue you've observed in detail..."
                className="min-h-[120px]"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select
                value={formData.severity}
                onValueChange={(value) =>
                  setFormData({ ...formData, severity: value })
                }
              >
                <SelectTrigger id="severity">
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low - Not urgent</SelectItem>
                  <SelectItem value="medium">
                    Medium - Needs attention
                  </SelectItem>
                  <SelectItem value="high">
                    High - Potentially dangerous
                  </SelectItem>
                  <SelectItem value="critical">
                    Critical - Immediate danger
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-2">
              Please add photos of the electrical issue (optional). You can take
              new photos or upload from your gallery.
            </p>
            <PhotoUploader onPhotosChange={handlePhotosChange} />

            {isLoggedInViaFacebook && (
              <div className="mt-6 p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="facebook-post"
                    checked={postToFacebook}
                    onCheckedChange={(checked) =>
                      setPostToFacebook(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="facebook-post"
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Facebook className="h-4 w-4 text-blue-600" />
                    <span>Share this report on Facebook</span>
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-6">
                  This will post a summary of your report to your Facebook
                  timeline to help raise awareness about electrical
                  infrastructure issues.
                </p>
              </div>
            )}

            {isLoggedInViaTwitter && (
              <div className="mt-6 p-4 border rounded-lg bg-sky-50">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="twitter-post"
                    checked={postToTwitter}
                    onCheckedChange={(checked) =>
                      setPostToTwitter(checked as boolean)
                    }
                  />
                  <Label
                    htmlFor="twitter-post"
                    className="flex items-center space-x-2 cursor-pointer"
                  >
                    <Twitter className="h-4 w-4 text-sky-600" />
                    <span>Share this report on Twitter</span>
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-2 ml-6">
                  This will post a summary of your report as a tweet to help
                  raise awareness about electrical infrastructure issues.
                </p>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto bg-green-100 rounded-full p-3 w-16 h-16 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Thank You!</h3>
            <p className="text-muted-foreground">
              Your report has been {mode === "edit" ? "updated" : "submitted"}{" "}
              successfully. The reference number for your report is:
            </p>
            <p className="text-lg font-mono bg-muted p-2 rounded">
              {reportId || `REP-${Date.now().toString().slice(-8)}`}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              You can use this reference number to check the status of your
              report.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between px-6 py-4 border-t">
        {step < 4 ? (
          <>
            {step > 1 ? (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={isSubmitting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}

            {step < 3 ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Report"}
              </Button>
            )}
          </>
        ) : (
          <Button className="w-full" onClick={onCancel}>
            {mode === "edit" ? "Back to Report" : "Create Another Report"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ReportForm;
