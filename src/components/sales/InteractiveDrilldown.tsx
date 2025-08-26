import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { supabase } from "@/integrations/supabase/client";
import { 
  ChevronRight,
  Filter,
  Search,
  ArrowUpDown,
  Eye,
  TrendingUp,
  Users,
  Building,
  Calendar,
  DollarSign,
  Target,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Treemap
} from 'recharts';

interface DrilldownLevel {
  id: string;
  name: string;
  type: 'overview' | 'region' | 'team' | 'rep' | 'account' | 'deal';
  parent?: string;
}

interface DrilldownData {
  id: string;
  name: string;
  value: number;
  count: number;
  percentage: number;
  trend: number;
  color: string;
  children?: DrilldownData[];
  metadata: Record<string, any>;
}

interface FilterCriteria {
  dateRange: string;
  minValue: number;
  maxValue: number;
  stage: string;
  search: string;
}

const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))'
];

export default function InteractiveDrilldown() {
  const [currentLevel, setCurrentLevel] = useState<DrilldownLevel>({ id: 'overview', name: 'Sales Overview', type: 'overview' });
  const [breadcrumb, setBreadcrumb] = useState<DrilldownLevel[]>([]);
  const [data, setData] = useState<DrilldownData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterCriteria>({
    dateRange: '30',
    minValue: 0,
    maxValue: 1000000,
    stage: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'name' | 'value' | 'count' | 'trend'>('value');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadDrilldownData();
  }, [currentLevel, filters]);

  const loadDrilldownData = async () => {
    setLoading(true);
    try {
      let drilldownData: DrilldownData[] = [];

      switch (currentLevel.type) {
        case 'overview':
          drilldownData = await loadOverviewData();
          break;
        case 'region':
          drilldownData = await loadRegionData();
          break;
        case 'team':
          drilldownData = await loadTeamData();
          break;
        case 'rep':
          drilldownData = await loadRepData();
          break;
        case 'account':
          drilldownData = await loadAccountData();
          break;
        case 'deal':
          drilldownData = await loadDealData();
          break;
      }

      // Apply filters and sorting
      drilldownData = applyFilters(drilldownData);
      drilldownData = applySorting(drilldownData);

      setData(drilldownData);
    } catch (error) {
      console.error('Error loading drilldown data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOverviewData = async (): Promise<DrilldownData[]> => {
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .gte('created_at', new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000).toISOString());

    if (!deals) return [];

    // Group by regions (mock data - in real app this would come from deal/account data)
    const regions = ['North America', 'Europe', 'Asia Pacific', 'Latin America'];
    
    return regions.map((region, index) => {
      const regionDeals = deals.filter(() => Math.random() > 0.5); // Mock filtering
      const value = regionDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const count = regionDeals.length;
      
      return {
        id: region.toLowerCase().replace(/\s+/g, '-'),
        name: region,
        value,
        count,
        percentage: value / deals.reduce((sum, d) => sum + (d.value || 0), 0) * 100,
        trend: (Math.random() - 0.5) * 20,
        color: COLORS[index % COLORS.length],
        metadata: { type: 'region', dealCount: count, avgDealSize: count > 0 ? value / count : 0 }
      };
    });
  };

  const loadRegionData = async (): Promise<DrilldownData[]> => {
    // Mock team data for selected region
    const teams = ['Enterprise Sales', 'SMB Sales', 'Channel Partners', 'Inside Sales'];
    
    return teams.map((team, index) => ({
      id: team.toLowerCase().replace(/\s+/g, '-'),
      name: team,
      value: Math.random() * 500000 + 100000,
      count: Math.floor(Math.random() * 50) + 10,
      percentage: Math.random() * 100,
      trend: (Math.random() - 0.5) * 15,
      color: COLORS[index % COLORS.length],
      metadata: { type: 'team', manager: `Manager ${index + 1}`, size: Math.floor(Math.random() * 10) + 3 }
    }));
  };

  const loadTeamData = async (): Promise<DrilldownData[]> => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'sales_rep');

    if (!profiles) return [];

    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .gte('created_at', new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000).toISOString());

    return profiles.map((rep, index) => {
      const repDeals = deals?.filter(d => d.deal_owner_name === rep.email) || [];
      const value = repDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const count = repDeals.length;
      
      return {
        id: rep.id,
        name: `${rep.first_name} ${rep.last_name}`,
        value,
        count,
        percentage: count > 0 ? Math.random() * 100 : 0,
        trend: (Math.random() - 0.5) * 25,
        color: COLORS[index % COLORS.length],
        metadata: { 
          type: 'rep', 
          email: rep.email,
          quota: Math.random() * 200000 + 100000,
          conversionRate: Math.random() * 30 + 10
        }
      };
    });
  };

  const loadRepData = async (): Promise<DrilldownData[]> => {
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('deal_owner_name', currentLevel.id)
      .gte('created_at', new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000).toISOString());

    if (!deals) return [];

    // Group by accounts
    const accountGroups = deals.reduce((acc, deal) => {
      const accountName = deal.account_id || 'Unknown Account';
      if (!acc[accountName]) {
        acc[accountName] = [];
      }
      acc[accountName].push(deal);
      return acc;
    }, {} as Record<string, any[]>);

    return Object.entries(accountGroups).map(([accountName, accountDeals], index) => {
      const value = accountDeals.reduce((sum, deal) => sum + (deal.value || 0), 0);
      const count = accountDeals.length;
      
      return {
        id: accountName.toLowerCase().replace(/\s+/g, '-'),
        name: accountName,
        value,
        count,
        percentage: count > 0 ? Math.random() * 100 : 0,
        trend: (Math.random() - 0.5) * 20,
        color: COLORS[index % COLORS.length],
        metadata: { 
          type: 'account',
          industry: 'Technology', // Mock data
          size: ['Small', 'Medium', 'Large', 'Enterprise'][Math.floor(Math.random() * 4)]
        }
      };
    });
  };

  const loadAccountData = async (): Promise<DrilldownData[]> => {
    const { data: deals } = await supabase
      .from('deals')
      .select('*')
      .eq('account_id', currentLevel.id)
      .gte('created_at', new Date(Date.now() - parseInt(filters.dateRange) * 24 * 60 * 60 * 1000).toISOString());

    if (!deals) return [];

    return deals.map((deal, index) => ({
      id: deal.id,
      name: deal.name || `Deal ${deal.id}`,
      value: deal.value || 0,
      count: 1,
      percentage: (deal.probability || 50),
      trend: 0,
      color: COLORS[index % COLORS.length],
      metadata: {
        type: 'deal',
        stage: deal.stage,
        closeDate: deal.close_date,
        probability: deal.probability,
        owner: deal.deal_owner_name
      }
    }));
  };

  const loadDealData = async (): Promise<DrilldownData[]> => {
    // This would show deal details, activities, etc.
    return [];
  };

  const applyFilters = (data: DrilldownData[]): DrilldownData[] => {
    return data.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchesValue = item.value >= filters.minValue && item.value <= filters.maxValue;
      const matchesStage = filters.stage === 'all' || item.metadata.stage === filters.stage;
      
      return matchesSearch && matchesValue && matchesStage;
    });
  };

  const applySorting = (data: DrilldownData[]): DrilldownData[] => {
    return [...data].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'value':
          aValue = a.value;
          bValue = b.value;
          break;
        case 'count':
          aValue = a.count;
          bValue = b.count;
          break;
        case 'trend':
          aValue = a.trend;
          bValue = b.trend;
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  const drillDown = (item: DrilldownData) => {
    const newLevel: DrilldownLevel = {
      id: item.id,
      name: item.name,
      type: getNextLevelType(currentLevel.type),
      parent: currentLevel.id
    };

    setBreadcrumb([...breadcrumb, currentLevel]);
    setCurrentLevel(newLevel);
  };

  const drillUp = (targetLevel?: DrilldownLevel) => {
    if (targetLevel) {
      // Navigate to specific level
      const targetIndex = breadcrumb.findIndex(level => level.id === targetLevel.id);
      setBreadcrumb(breadcrumb.slice(0, targetIndex));
      setCurrentLevel(targetLevel);
    } else if (breadcrumb.length > 0) {
      // Go back one level
      const previousLevel = breadcrumb[breadcrumb.length - 1];
      setBreadcrumb(breadcrumb.slice(0, -1));
      setCurrentLevel(previousLevel);
    }
  };

  const getNextLevelType = (currentType: string): DrilldownLevel['type'] => {
    const hierarchy: DrilldownLevel['type'][] = ['overview', 'region', 'team', 'rep', 'account', 'deal'];
    const currentIndex = hierarchy.indexOf(currentType as any);
    return hierarchy[Math.min(currentIndex + 1, hierarchy.length - 1)];
  };

  const handleSort = (column: 'name' | 'value' | 'count' | 'trend') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const getTotalValue = () => data.reduce((sum, item) => sum + item.value, 0);
  const getTotalCount = () => data.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink 
                  onClick={() => drillUp({ id: 'overview', name: 'Sales Overview', type: 'overview' })}
                  className="cursor-pointer"
                >
                  Overview
                </BreadcrumbLink>
              </BreadcrumbItem>
              {breadcrumb.map((level, index) => (
                <div key={level.id} className="flex items-center">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      onClick={() => drillUp(level)}
                      className="cursor-pointer"
                    >
                      {level.name}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                </div>
              ))}
              {currentLevel.id !== 'overview' && (
                <div className="flex items-center">
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentLevel.name}</BreadcrumbPage>
                  </BreadcrumbItem>
                </div>
              )}
            </BreadcrumbList>
          </Breadcrumb>
          <h2 className="text-3xl font-bold mt-2">Interactive Sales Analysis</h2>
          <p className="text-muted-foreground">Click on any metric to drill down for detailed insights</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <Input
                placeholder="Search..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="w-40"
              />
            </div>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
            </select>
            <select
              value={filters.stage}
              onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Stages</option>
              <option value="prospect">Prospect</option>
              <option value="qualified">Qualified</option>
              <option value="proposal">Proposal</option>
              <option value="negotiation">Negotiation</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${getTotalValue().toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{getTotalCount()}</p>
              </div>
              <Layers className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Value</p>
                <p className="text-2xl font-bold">
                  ${getTotalCount() > 0 ? (getTotalValue() / getTotalCount()).toLocaleString() : '0'}
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Current Level</p>
                <p className="text-lg font-semibold capitalize">{currentLevel.type}</p>
              </div>
              <Eye className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TreeMap */}
        <Card>
          <CardHeader>
            <CardTitle>Proportional View</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <Treemap
                data={data}
                dataKey="value"
                stroke="#fff"
                fill="hsl(var(--primary))"
              />
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Data</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('name')} className="p-0 h-auto font-semibold">
                    Name <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('value')} className="p-0 h-auto font-semibold">
                    Value <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('count')} className="p-0 h-auto font-semibold">
                    Count <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort('trend')} className="p-0 h-auto font-semibold">
                    Trend <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>${item.value.toLocaleString()}</TableCell>
                  <TableCell>{item.count}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {item.trend > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                      )}
                      <span className={item.trend > 0 ? 'text-green-600' : 'text-red-600'}>
                        {Math.abs(item.trend).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {currentLevel.type !== 'deal' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => drillDown(item)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}