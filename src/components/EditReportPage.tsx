import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReportForm, { ReportData } from "./ReportForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";
import { supabase, Report } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

const EditReportPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
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

        // Check if user owns this report
        if (data.user_id !== user?.id) {
          setError("You can only edit your own reports");
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
  }, [id, user?.id]);

  const handleSubmit = (data: ReportData) => {
    console.log("Report updated:", data);
    // Navigate back to the report details page
    navigate(`/report/${id}`);
  };

  const handleCancel = () => {
    navigate(`/report/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/")}
                className="mr-4"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Home
              </Button>
              <h1 className="text-2xl font-bold text-gray-900">Edit Report</h1>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white p-6 rounded-lg shadow text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => navigate("/")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>
        </main>
      </div>
    );
  }

  const initialData = {
    id: report.id,
    title: report.title || "",
    description: report.description,
    severity: report.severity,
    location: {
      latitude: report.location_latitude,
      longitude: report.location_longitude,
      address: report.location_address,
    },
    photos: [], // Photos will be handled separately
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={() => navigate(`/report/${id}`)}
              className="mr-4"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Report
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Infrastructure Report
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReportForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          initialData={initialData}
          mode="edit"
        />
      </main>
    </div>
  );
};

export default EditReportPage;
