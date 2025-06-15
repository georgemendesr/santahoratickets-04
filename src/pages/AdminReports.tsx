
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import { MainLayout } from "@/components/layout/MainLayout";
import { BackButton } from "@/components/common/BackButton";
import { ReportsHeader } from "@/components/admin/reports/ReportsHeader";
import { EventsReportTable } from "@/components/admin/reports/EventsReportTable";
import { EventDetailedReport } from "@/components/admin/reports/EventDetailedReport";
import { useFinancialSummary, useEventsFinancialReport, useEventDetailedReport } from "@/hooks/useReports";
import { exportEventsReportToCSV } from "@/utils/exportReports";
import { useState, useEffect } from "react";
import { ReportFilters } from "@/types/reports.types";

const AdminReports = () => {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const { isAdmin } = useRole(session);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    period: '30d'
  });

  useEffect(() => {
    if (!loading && (!session || !isAdmin)) {
      console.log("[AdminReports] Access denied, redirecting to home");
      navigate("/");
    }
  }, [loading, session, isAdmin, navigate]);

  const { data: summary, isLoading: summaryLoading } = useFinancialSummary(filters);
  const { data: eventsReport, isLoading: eventsLoading } = useEventsFinancialReport(filters);
  const { data: eventDetail, isLoading: detailLoading } = useEventDetailedReport(selectedEventId || '');

  const handleExportAll = () => {
    if (eventsReport) {
      exportEventsReportToCSV(eventsReport);
    }
  };

  const handleViewDetails = (eventId: string) => {
    setSelectedEventId(eventId);
  };

  const handleBackToList = () => {
    setSelectedEventId(null);
  };

  // Show loading while checking authentication
  if (loading || !session || !isAdmin) {
    return (
      <MainLayout>
        <div className="container max-w-7xl mx-auto py-8">
          <div className="flex justify-center items-center min-h-[200px]">
            <p>Verificando permissões...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container max-w-7xl mx-auto py-8">
        <BackButton to="/admin" className="mb-6" />
        
        {selectedEventId && eventDetail ? (
          <EventDetailedReport
            report={eventDetail}
            onBack={handleBackToList}
          />
        ) : (
          <div className="space-y-8">
            <ReportsHeader
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExportAll}
              summary={summary}
            />

            <EventsReportTable
              reports={eventsReport || []}
              onViewDetails={handleViewDetails}
              isLoading={eventsLoading}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default AdminReports;
