import { useState } from 'react'
import ReportList from '@/components/reports/ReportList'
import ReportBuilder from '@/components/reports/ReportBuilder'
import ReportViewer from '@/components/reports/ReportViewer'

type View = 'list' | 'builder' | 'viewer'

export default function ReportsDashboard() {
  const [currentView, setCurrentView] = useState<View>('list')
  const [selectedReportId, setSelectedReportId] = useState<string>('')

  const handleCreateNew = () => {
    setSelectedReportId('')
    setCurrentView('builder')
  }

  const handleEditReport = (reportId: string) => {
    setSelectedReportId(reportId)
    setCurrentView('builder')
  }

  const handleViewReport = (reportId: string) => {
    setSelectedReportId(reportId)
    setCurrentView('viewer')
  }

  const handleSaveReport = (report: any) => {
    setCurrentView('list')
  }

  const handleCancelBuilder = () => {
    setCurrentView('list')
  }

  const handleBackToList = () => {
    setCurrentView('list')
  }

  const handleEditFromViewer = () => {
    setCurrentView('builder')
  }

  return (
    <div className="container mx-auto py-6">
      {currentView === 'list' && (
        <ReportList
          onCreateNew={handleCreateNew}
          onEditReport={handleEditReport}
          onViewReport={handleViewReport}
        />
      )}
      
      {currentView === 'builder' && (
        <ReportBuilder
          reportId={selectedReportId || undefined}
          onSave={handleSaveReport}
          onCancel={handleCancelBuilder}
        />
      )}
      
      {currentView === 'viewer' && selectedReportId && (
        <ReportViewer
          reportId={selectedReportId}
          onBack={handleBackToList}
          onEdit={handleEditFromViewer}
        />
      )}
    </div>
  )
}