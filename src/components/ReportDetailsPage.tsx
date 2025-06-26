import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { ArrowLeft, MapPin, Clock, AlertTriangle } from "lucide-react";
import { supabase, Report } from "@/lib/supabase";

const ReportDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [report, setReport] = React.useState<Report | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchReport = async () => {
      if (!id) {
        setError("No report ID provided");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("id", id)
          .single();

        if (error) {
          console.error("Error fetching report:", error);
          setError("Failed to load report details");
          return;
        }

        setReport(data);
      } catch (error) {
        console.error("Error fetching report:", error);
        setError("Failed to load report details");
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
      case "critical":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading report details...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-3xl font-bold text-gray-900">
                Report Details
              </h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className="bg-white p-6 text-center">
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Report Not Found
              </h3>
              <p className="text-gray-500 mb-6">
                {error || "The requested report could not be found."}
              </p>
              <Button onClick={() => navigate("/")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Report Details</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white overflow-hidden">
          {/* Report Images */}
          {report.image_urls && report.image_urls.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6 border-b">
              {report.image_urls.map((imageUrl, index) => (
                <div
                  key={index}
                  className="aspect-video overflow-hidden rounded-lg"
                >
                  <img
                    src={imageUrl}
                    alt={`Report image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">
                  {report.title ||
                    `Report #${report.id.slice(-8).toUpperCase()}`}
                </CardTitle>
                <CardDescription className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  Reported on {formatDate(report.created_at || "")}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(report.severity)}`}
                >
                  {report.severity.charAt(0).toUpperCase() +
                    report.severity.slice(1)}{" "}
                  Priority
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(report.status)}`}
                >
                  {report.status
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Title (if different from generated title) */}
            {report.title && (
              <div>
                <h3 className="text-lg font-semibold mb-2">Title</h3>
                <p className="text-gray-700 leading-relaxed font-medium">
                  {report.title}
                </p>
              </div>
            )}

            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">
                {report.description}
              </p>
            </div>

            {/* Location and Timestamp */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Location</h3>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-700">{report.location_address}</p>
                    {report.location_coordinates && (
                      <p className="text-sm text-gray-500 mt-1">
                        Coordinates:{" "}
                        {report.location_coordinates.lat.toFixed(6)},{" "}
                        {report.location_coordinates.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Timestamp */}
              <div>
                <h3 className="text-lg font-semibold mb-2">Reported</h3>
                <div className="flex items-start space-x-2">
                  <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                  <p className="text-gray-700">
                    {formatDate(report.created_at || "")}
                  </p>
                </div>
              </div>
            </div>

            {/* Additional Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Report ID</h4>
                <p className="text-gray-600 font-mono text-sm">{report.id}</p>
              </div>
              {report.updated_at && report.updated_at !== report.created_at && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-1">
                    Last Updated
                  </h4>
                  <p className="text-gray-600">
                    {formatDate(report.updated_at)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default ReportDetailsPage;
