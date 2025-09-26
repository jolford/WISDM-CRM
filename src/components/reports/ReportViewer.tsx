import SpectacularReportViewer from './SpectacularReportViewer';

interface ReportViewerProps {
  reportId: string;
  onBack: () => void;
  onEdit: () => void;
}

export default function ReportViewer({ reportId, onBack, onEdit }: ReportViewerProps) {
  return (
    <SpectacularReportViewer
      reportId={reportId}
      onBack={onBack}
      onEdit={onEdit}
    />
  );
}