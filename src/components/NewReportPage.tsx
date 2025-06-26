import React from "react";
import { useNavigate } from "react-router-dom";
import ReportForm, { ReportData } from "./ReportForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

const NewReportPage = () => {
  const navigate = useNavigate();

  const handleSubmit = (data: ReportData) => {
    console.log("Report submitted:", data);
    // Here you would typically send the data to your backend
    // For now, we'll just navigate back to home after a delay
    setTimeout(() => {
      navigate("/");
    }, 2000);
  };

  const handleCancel = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
            <h1 className="text-2xl font-bold text-gray-900">
              New Infrastructure Report
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReportForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </main>
    </div>
  );
};

export default NewReportPage;
