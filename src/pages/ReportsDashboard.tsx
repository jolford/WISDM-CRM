import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ReportList from '@/components/reports/ReportList'
import ReportBuilder from '@/components/reports/ReportBuilder'
import ReportViewer from '@/components/reports/ReportViewer'
import SalesKPIDashboard from '@/components/sales/SalesKPIDashboard'
import PipelineAnalytics from '@/components/sales/PipelineAnalytics'
import SalesPerformanceReports from '@/components/sales/SalesPerformanceReports'
import ForecastingTrends from '@/components/sales/ForecastingTrends'
import InteractiveDrilldown from '@/components/sales/InteractiveDrilldown'

type View = 'dashboard' | 'list' | 'builder' | 'viewer'

export default function ReportsDashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard')
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

  if (currentView === 'builder') {
    return (
      <div className="container mx-auto py-6">
        <ReportBuilder
          reportId={selectedReportId || undefined}
          onSave={handleSaveReport}
          onCancel={handleCancelBuilder}
        />
      </div>
    )
  }

  if (currentView === 'viewer' && selectedReportId) {
    return (
      <div className="container mx-auto py-6">
        <ReportViewer
          reportId={selectedReportId}
          onBack={handleBackToList}
          onEdit={handleEditFromViewer}
        />
      </div>
    )
  }

  if (currentView === 'list') {
    return (
      <div className="container mx-auto py-6">
        <ReportList
          onCreateNew={handleCreateNew}
          onEditReport={handleEditReport}
          onViewReport={handleViewReport}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <Tabs defaultValue="kpi" className="w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold">Advanced Sales Analytics</h1>
            <p className="text-muted-foreground">Comprehensive sales reporting that surpasses traditional CRM capabilities</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setCurrentView('list')}
              className="px-4 py-2 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80"
            >
              Custom Reports
            </button>
            <button 
              onClick={handleCreateNew}
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
            >
              Build Report
            </button>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="kpi">KPI Dashboard</TabsTrigger>
          <TabsTrigger value="pipeline">Pipeline Analytics</TabsTrigger>
          <TabsTrigger value="performance">Sales Performance</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting & AI</TabsTrigger>
          <TabsTrigger value="drilldown">Interactive Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="kpi" className="space-y-6">
          <SalesKPIDashboard />
        </TabsContent>

        <TabsContent value="pipeline" className="space-y-6">
          <PipelineAnalytics />
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <SalesPerformanceReports />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-6">
          <ForecastingTrends />
        </TabsContent>

        <TabsContent value="drilldown" className="space-y-6">
          <InteractiveDrilldown />
        </TabsContent>
      </Tabs>
    </div>
  )
}