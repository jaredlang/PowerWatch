import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { PlusCircle, AlertTriangle, Clock, MapPin } from "lucide-react";
import { supabase, Report } from "@/lib/supabase";
import AuthButton from "./AuthButton";
import { useAuth } from "@/contexts/AuthContext";

interface DisplayReport {
  id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  location: string;
  timestamp: string;
  status: "pending" | "in-progress" | "resolved";
  imageUrl?: string;
}

const Home = () => {
  const { user } = useAuth();
  const [reports, setReports] = React.useState<DisplayReport[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching reports:", error);
          return;
        }

        const displayReports: DisplayReport[] = data.map((report: Report) => ({
          id: report.id,
          title: generateTitle(
            report.title,
            report.description,
            report.severity,
          ),
          description: report.description,
          severity: report.severity as "low" | "medium" | "high" | "critical",
          location: report.location_address,
          timestamp: report.created_at || "",
          status: report.status as "pending" | "in-progress" | "resolved",
          imageUrl: report.image_urls?.[0] || undefined,
        }));

        setReports(displayReports);
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const generateTitle = (
    title: string | null,
    description: string,
    severity: string,
  ): string => {
    if (title && title.trim()) {
      return title;
    }
    const words = description.split(" ").slice(0, 4).join(" ");
    return words.charAt(0).toUpperCase() + words.slice(1);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-red-100 text-red-800";
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
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Electrical Infrastructure Issue Reporting
            </h1>
            <div className="flex items-center gap-4">
              {user ? (
                <Button className="bg-primary hover:bg-primary/90">
                  <Link to="/report/new" className="flex items-center">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    New Report
                  </Link>
                </Button>
              ) : (
                <Button className="bg-primary hover:bg-primary/90">
                  <Link to="/login" className="flex items-center">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Sign In to Report
                  </Link>
                </Button>
              )}
              <AuthButton />
            </div>
          </div>
          {user && (
            <div className="mt-2 text-sm text-gray-600">
              Welcome back, {user.user_metadata?.full_name || user.email}!
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Introduction Section */}
        <section className="mb-10">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Report Electrical Infrastructure Issues</CardTitle>
              <CardDescription>
                Help us maintain safe electrical infrastructure by reporting
                issues you observe.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Use this application to report any electrical infrastructure
                problems such as loose wires, tree branches obstructing power
                lines, damaged utility poles, or other hazards. Your reports
                help us address issues quickly and keep our community safe.
              </p>
            </CardContent>
            <CardFooter>
              {user ? (
                <Button className="w-full sm:w-auto">
                  <Link
                    to="/report/new"
                    className="flex items-center justify-center"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Create New Report
                  </Link>
                </Button>
              ) : (
                <Button className="w-full sm:w-auto">
                  <Link
                    to="/login"
                    className="flex items-center justify-center"
                  >
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Sign In to Create Report
                  </Link>
                </Button>
              )}
            </CardFooter>
          </Card>
        </section>

        {/* Previous Reports Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              Previous Reports
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading reports...</p>
            </div>
          ) : reports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  {report.imageUrl && (
                    <div className="h-48 overflow-hidden">
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{report.title}</CardTitle>
                      <div
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(report.severity)}`}
                      >
                        {report.severity.charAt(0).toUpperCase() +
                          report.severity.slice(1)}
                      </div>
                    </div>
                    <CardDescription className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatDate(report.timestamp)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{report.description}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 mr-1" />
                      {report.location}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center">
                    <div
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}
                    >
                      {report.status
                        .split("-")
                        .map(
                          (word) =>
                            word.charAt(0).toUpperCase() + word.slice(1),
                        )
                        .join(" ")}
                    </div>
                    <Button variant="outline" size="sm">
                      <Link to={`/report/${report.id}`}>View Details</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white p-6 text-center">
              <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No reports yet
                </h3>
                <p className="text-gray-500 mb-6">
                  {user
                    ? "Create your first report to get started"
                    : "Sign in to create your first report"}
                </p>
                {user ? (
                  <Button>
                    <Link to="/report/new" className="flex items-center">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Create New Report
                    </Link>
                  </Button>
                ) : (
                  <Button>
                    <Link to="/login" className="flex items-center">
                      <PlusCircle className="mr-2 h-5 w-5" />
                      Sign In to Create Report
                    </Link>
                  </Button>
                )}
              </div>
            </Card>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Electrical Infrastructure Issue
            Reporting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
