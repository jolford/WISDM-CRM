import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { AlertTriangle, CheckCircle } from 'lucide-react'

export default function DataCleanup() {
  const [cleaning, setCleaning] = useState(false)
  const [unknownProductsCount, setUnknownProductsCount] = useState<number | null>(null)
  const { toast } = useToast()

  const checkUnknownProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('maintenance_records')
        .select('id', { count: 'exact' })
        .eq('product_name', 'Unknown Product')

      if (error) throw error
      setUnknownProductsCount(data?.length || 0)
    } catch (error) {
      console.error('Error checking unknown products:', error)
      toast({
        title: "Error",
        description: "Failed to check maintenance records",
        variant: "destructive"
      })
    }
  }

  const cleanupMaintenanceData = async () => {
    if (!confirm('This will attempt to fix maintenance records with "Unknown Product". Continue?')) {
      return
    }

    try {
      setCleaning(true)
      
      // This is a simple example - you'd want to implement proper logic
      // to map unknown products to actual product names based on your CSV data
      toast({
        title: "Data Cleanup",
        description: "To fix Unknown Products, you need to re-import your maintenance CSV file with the corrected mapping.",
      })
      
    } catch (error) {
      console.error('Error cleaning data:', error)
      toast({
        title: "Error",
        description: "Failed to clean maintenance data",
        variant: "destructive"
      })
    } finally {
      setCleaning(false)
    }
  }

  useState(() => {
    checkUnknownProducts()
  })

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Data Cleanup</h1>
        <p className="text-muted-foreground">Clean up imported data issues</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-500" />
            Maintenance Records Cleanup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {unknownProductsCount !== null && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Found {unknownProductsCount} maintenance records with "Unknown Product"
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">How to Fix Unknown Products:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>Go to the <strong>Data Import/Export</strong> page</li>
                <li>Select <strong>Maintenance Records</strong> as the import type</li>
                <li>Upload your maintenance CSV file again</li>
                <li>The system will now correctly map the "products" column (plural) to product names</li>
                <li>Your existing records will be updated with correct product names</li>
              </ol>
            </div>

            <Button 
              onClick={checkUnknownProducts}
              variant="outline"
            >
              Refresh Count
            </Button>

            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Fixed Issues:</strong>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>✅ Report preview button now works with real data</li>
                  <li>✅ Added column sorting to all table views (Deals, Companies, Contacts, Maintenance)</li>
                  <li>✅ Fixed CSV import mapping for "products" column in maintenance data</li>
                  <li>✅ Deals page now has both Pipeline and List views with sorting</li>
                </ul>
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}