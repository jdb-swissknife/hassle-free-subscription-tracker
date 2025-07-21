import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useSupabaseSubscriptions } from '@/hooks/useSupabaseSubscriptions'
import { exportToJSON, exportToCSV, calculateTotalCosts, ExportData } from '@/utils/dataExport'
import { Download, FileJson, FileSpreadsheet, BarChart3 } from 'lucide-react'
import { toast } from 'sonner'

export default function DataExport() {
  const { subscriptions, loading } = useSupabaseSubscriptions()
  const [exporting, setExporting] = useState(false)

  const handleJSONExport = async () => {
    if (!subscriptions?.length) {
      toast.error('No subscriptions to export')
      return
    }

    setExporting(true)
    try {
      const { monthly, yearly } = calculateTotalCosts(subscriptions)
      
      const exportData: ExportData = {
        subscriptions,
        exportDate: new Date().toISOString(),
        totalSubscriptions: subscriptions.length,
        totalMonthlyCost: monthly,
        totalYearlyCost: yearly
      }

      exportToJSON(exportData)
      toast.success('Data exported to JSON successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  const handleCSVExport = async () => {
    if (!subscriptions?.length) {
      toast.error('No subscriptions to export')
      return
    }

    setExporting(true)
    try {
      exportToCSV(subscriptions)
      toast.success('Data exported to CSV successfully!')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Failed to export data')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export Data</CardTitle>
          <CardDescription>Loading subscription data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    )
  }

  const totalCosts = subscriptions ? calculateTotalCosts(subscriptions) : { monthly: 0, yearly: 0 }
  const activeSubscriptions = subscriptions?.filter(sub => sub.active).length || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Data
        </CardTitle>
        <CardDescription>
          Download your subscription data in different formats
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold">{subscriptions?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Subscriptions</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold">{activeSubscriptions}</div>
            <div className="text-sm text-muted-foreground">Active</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold">${totalCosts.monthly.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Monthly Cost</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold">${totalCosts.yearly.toFixed(2)}</div>
            <div className="text-sm text-muted-foreground">Yearly Cost</div>
          </div>
        </div>

        {/* Export Options */}
        <div className="space-y-4">
          <h3 className="font-medium">Export Options</h3>
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileJson className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-medium">JSON Export</div>
                  <div className="text-sm text-muted-foreground">
                    Complete data with metadata and statistics
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">Recommended</Badge>
                <Button 
                  onClick={handleJSONExport} 
                  disabled={exporting || !subscriptions?.length}
                  size="sm"
                >
                  <FileJson className="w-4 h-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-8 h-8 text-green-500" />
                <div>
                  <div className="font-medium">CSV Export</div>
                  <div className="text-sm text-muted-foreground">
                    Spreadsheet format for analysis and import
                  </div>
                </div>
              </div>
              <Button 
                onClick={handleCSVExport} 
                disabled={exporting || !subscriptions?.length}
                size="sm"
                variant="outline"
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
        </div>

        {!subscriptions?.length && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No subscription data to export</p>
            <p className="text-sm">Add some subscriptions first to use the export feature</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}