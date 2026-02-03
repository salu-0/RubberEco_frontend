import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Download,
  Calendar,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Leaf,
  BarChart3,
  PieChart,
  Activity,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Printer,
  ChevronDown,
  ChevronUp,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  Droplets
} from 'lucide-react';

const Reports = ({ darkMode }) => {
  const [activeReport, setActiveReport] = useState('overview');
  const [dateRange, setDateRange] = useState('month');
  const [loading, setLoading] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  // Sample report data
  const [reportData, setReportData] = useState({
    overview: {
      totalRevenue: 2450000,
      totalExpenses: 890000,
      netProfit: 1560000,
      growthRate: 12.5,
      totalOrders: 342,
      activeStaff: 28,
      pendingPayments: 45000
    },
    production: {
      totalLatex: 15200,
      avgYieldPerTree: 2.4,
      activePlantations: 45,
      tappingDays: 24,
      monthlyTrend: [
        { month: 'Aug', value: 12500 },
        { month: 'Sep', value: 13200 },
        { month: 'Oct', value: 14100 },
        { month: 'Nov', value: 14800 },
        { month: 'Dec', value: 15200 },
        { month: 'Jan', value: 15200 }
      ]
    },
    staff: {
      totalStaff: 28,
      activeTappers: 18,
      fieldOfficers: 5,
      trainers: 3,
      supervisors: 2,
      avgPerformance: 87,
      topPerformers: [
        { name: 'Amal Anto', role: 'Tapper', score: 96, tasks: 142 },
        { name: 'Helan Antony', role: 'Tapper', score: 94, tasks: 138 },
        { name: 'Aleena Anna Alex', role: 'Field Officer', score: 92, tasks: 125 }
      ]
    },
    financial: {
      revenue: [
        { category: 'Rubber Sales', amount: 1850000, percentage: 75.5 },
        { category: 'Nursery Sales', amount: 420000, percentage: 17.1 },
        { category: 'Training Fees', amount: 120000, percentage: 4.9 },
        { category: 'Other Services', amount: 60000, percentage: 2.5 }
      ],
      expenses: [
        { category: 'Staff Salaries', amount: 520000, percentage: 58.4 },
        { category: 'Equipment', amount: 180000, percentage: 20.2 },
        { category: 'Transportation', amount: 95000, percentage: 10.7 },
        { category: 'Maintenance', amount: 95000, percentage: 10.7 }
      ]
    },
    nursery: {
      totalSaplings: 12500,
      soldThisMonth: 850,
      bookings: 42,
      revenue: 420000,
      varietyBreakdown: [
        { variety: 'RRII 105', stock: 4500, sold: 320 },
        { variety: 'RRIM 600', stock: 3200, sold: 280 },
        { variety: 'GT 1', stock: 2800, sold: 150 },
        { variety: 'PB 260', stock: 2000, sold: 100 }
      ]
    }
  });

  const reportTypes = [
    { id: 'overview', name: 'Overview Report', icon: BarChart3, color: 'emerald' },
    { id: 'production', name: 'Production Report', icon: Droplets, color: 'blue' },
    { id: 'staff', name: 'Staff Performance', icon: Users, color: 'purple' },
    { id: 'financial', name: 'Financial Report', icon: DollarSign, color: 'green' },
    { id: 'nursery', name: 'Nursery Report', icon: Leaf, color: 'teal' }
  ];

  const dateRanges = [
    { id: 'week', name: 'This Week' },
    { id: 'month', name: 'This Month' },
    { id: 'quarter', name: 'This Quarter' },
    { id: 'year', name: 'This Year' },
    { id: 'custom', name: 'Custom Range' }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format currency for PDF export (uses Rs. instead of ₹ to avoid encoding issues)
  const formatCurrencyForExport = (amount) => {
    return 'Rs. ' + new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Generate report content based on active report
  const generateReportContent = (forExport = false) => {
    const reportName = reportTypes.find(r => r.id === activeReport)?.name || 'Report';
    const dateRangeName = dateRanges.find(d => d.id === dateRange)?.name || 'This Month';
    const generatedDate = new Date().toLocaleDateString('en-IN', { 
      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
    });

    // Use export-friendly currency format when exporting
    const currencyFormatter = forExport ? formatCurrencyForExport : formatCurrency;

    let content = {
      title: reportName,
      dateRange: dateRangeName,
      generatedAt: generatedDate,
      data: []
    };

    switch (activeReport) {
      case 'overview':
        content.data = [
          { label: 'Total Revenue', value: currencyFormatter(reportData.overview.totalRevenue) },
          { label: 'Total Expenses', value: currencyFormatter(reportData.overview.totalExpenses) },
          { label: 'Net Profit', value: currencyFormatter(reportData.overview.netProfit) },
          { label: 'Growth Rate', value: `${reportData.overview.growthRate}%` },
          { label: 'Total Orders', value: reportData.overview.totalOrders },
          { label: 'Active Staff', value: reportData.overview.activeStaff },
          { label: 'Pending Payments', value: currencyFormatter(reportData.overview.pendingPayments) }
        ];
        break;
      case 'production':
        content.data = [
          { label: 'Total Latex Collected', value: `${reportData.production.totalLatex.toLocaleString()} kg` },
          { label: 'Avg Yield Per Tree', value: `${reportData.production.avgYieldPerTree} kg` },
          { label: 'Active Plantations', value: reportData.production.activePlantations },
          { label: 'Tapping Days', value: reportData.production.tappingDays },
          { label: '--- Monthly Trend ---', value: '' },
          ...reportData.production.monthlyTrend.map(m => ({ label: m.month, value: `${m.value.toLocaleString()} kg` }))
        ];
        break;
      case 'staff':
        content.data = [
          { label: 'Total Staff', value: reportData.staff.totalStaff },
          { label: 'Active Tappers', value: reportData.staff.activeTappers },
          { label: 'Field Officers', value: reportData.staff.fieldOfficers },
          { label: 'Trainers', value: reportData.staff.trainers },
          { label: 'Supervisors', value: reportData.staff.supervisors },
          { label: 'Average Performance', value: `${reportData.staff.avgPerformance}%` },
          { label: '--- Top Performers ---', value: '' },
          ...reportData.staff.topPerformers.map((p, i) => ({ 
            label: `${i + 1}. ${p.name} (${p.role})`, 
            value: `${p.score}% - ${p.tasks} tasks` 
          }))
        ];
        break;
      case 'financial':
        content.data = [
          { label: '=== REVENUE ===', value: '' },
          ...reportData.financial.revenue.map(r => ({ 
            label: r.category, 
            value: `${currencyFormatter(r.amount)} (${r.percentage}%)` 
          })),
          { label: 'Total Revenue', value: currencyFormatter(reportData.financial.revenue.reduce((a, b) => a + b.amount, 0)) },
          { label: '', value: '' },
          { label: '=== EXPENSES ===', value: '' },
          ...reportData.financial.expenses.map(e => ({ 
            label: e.category, 
            value: `${currencyFormatter(e.amount)} (${e.percentage}%)` 
          })),
          { label: 'Total Expenses', value: currencyFormatter(reportData.financial.expenses.reduce((a, b) => a + b.amount, 0)) }
        ];
        break;
      case 'nursery':
        content.data = [
          { label: 'Total Saplings in Stock', value: reportData.nursery.totalSaplings.toLocaleString() },
          { label: 'Sold This Month', value: reportData.nursery.soldThisMonth },
          { label: 'Active Bookings', value: reportData.nursery.bookings },
          { label: 'Revenue', value: currencyFormatter(reportData.nursery.revenue) },
          { label: '--- Stock by Variety ---', value: '' },
          ...reportData.nursery.varietyBreakdown.map(v => ({ 
            label: v.variety, 
            value: `Stock: ${v.stock.toLocaleString()} | Sold: ${v.sold}` 
          }))
        ];
        break;
      default:
        break;
    }

    return content;
  };

  // Export as PDF
  const exportAsPDF = () => {
    setLoading(true);
    
    setTimeout(() => {
      const content = generateReportContent(true); // Use export-friendly formatting
      
      // Create PDF content as HTML with proper encoding
      const pdfContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title} - RubberEco</title>
  <style>
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; color: #1a1a1a; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
    .logo { font-size: 28px; font-weight: bold; color: #10b981; display: flex; align-items: center; justify-content: center; gap: 10px; }
    .logo-icon { width: 40px; height: 40px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 20px; }
    .title { font-size: 24px; margin: 10px 0; color: #1f2937; }
    .meta { color: #6b7280; font-size: 14px; }
    .content { margin-top: 20px; }
    .row { display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #e5e7eb; }
    .row:nth-child(even) { background-color: #f9fafb; }
    .label { font-weight: 500; color: #374151; }
    .value { font-weight: 600; color: #1f2937; text-align: right; }
    .section-header { background-color: #10b981; color: white; padding: 10px 16px; margin: 20px 0 10px 0; border-radius: 6px; font-weight: 600; }
    .footer { margin-top: 40px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; }
    @media print { 
      body { padding: 20px; } 
      .row:hover { background-color: transparent; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">
      <div class="logo-icon">R</div>
      <span>RubberEco Admin</span>
    </div>
    <h1 class="title">${content.title}</h1>
    <p class="meta">Period: ${content.dateRange} | Generated: ${content.generatedAt}</p>
  </div>
  <div class="content">
    ${content.data.map(item => {
      if (item.label.includes('===') || item.label.includes('---')) {
        return `<div class="section-header">${item.label.replace(/[=\-]/g, '').trim()}</div>`;
      }
      if (!item.label && !item.value) return '';
      return `<div class="row"><span class="label">${item.label}</span><span class="value">${item.value}</span></div>`;
    }).join('')}
  </div>
  <div class="footer">
    <p>This report was automatically generated by RubberEco Admin Dashboard</p>
    <p>&copy; ${new Date().getFullYear()} RubberEco - Rubber Plantation Management System</p>
  </div>
</body>
</html>`;

      // Create blob and download
      const blob = new Blob([pdfContent], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      setLoading(false);
      showNotification(`${content.title} ready to save as PDF. Use "Save as PDF" in the print dialog.`, 'success');
    }, 1000);
  };

  // Export as Excel (CSV)
  const exportAsExcel = () => {
    setLoading(true);
    
    setTimeout(() => {
      const content = generateReportContent(true); // Use export-friendly formatting
      
      // Create CSV content
      let csvContent = `${content.title}\n`;
      csvContent += `Period: ${content.dateRange}\n`;
      csvContent += `Generated: ${content.generatedAt}\n\n`;
      csvContent += `Field,Value\n`;
      
      content.data.forEach(item => {
        if (item.label || item.value) {
          // Escape commas and quotes in values
          const label = item.label.replace(/"/g, '""');
          const value = String(item.value).replace(/"/g, '""');
          csvContent += `"${label}","${value}"\n`;
        }
      });

      // Create blob and download with UTF-8 BOM for Excel compatibility
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `${content.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setLoading(false);
      showNotification(`${content.title} downloaded as ${fileName}`, 'success');
    }, 1000);
  };

  const handleExport = (format) => {
    if (format === 'pdf') {
      exportAsPDF();
    } else if (format === 'excel') {
      exportAsExcel();
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'emerald' }) => (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-5 border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } shadow-sm`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${darkMode ? `bg-${color}-500/20` : `bg-${color}-100`}`}>
          <Icon className={`w-5 h-5 ${darkMode ? `text-${color}-400` : `text-${color}-600`}`} />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-medium ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
            {trend === 'up' ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
            {trendValue}%
          </div>
        )}
      </div>
      <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</p>
      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>{title}</p>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className={`${darkMode ? 'bg-gray-800/50' : 'bg-white'} rounded-2xl p-6 border ${
        darkMode ? 'border-gray-700' : 'border-gray-200'
      } shadow-lg`}>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Reports & Analytics
            </h1>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              Comprehensive insights into your rubber plantation business
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Date Range Selector */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                darkMode 
                  ? 'bg-gray-700 border-gray-600 text-white' 
                  : 'bg-white border-gray-300 text-gray-700'
              }`}
            >
              {dateRanges.map((range) => (
                <option key={range.id} value={range.id}>{range.name}</option>
              ))}
            </select>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleExport('pdf')}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30' 
                    : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                }`}
              >
                <FileText className="w-4 h-4" />
                PDF
              </button>
              <button
                onClick={() => handleExport('excel')}
                disabled={loading}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-500/30' 
                    : 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200'
                }`}
              >
                <FileSpreadsheet className="w-4 h-4" />
                Excel
              </button>
              <button
                onClick={handlePrint}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300'
                }`}
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
            </div>
          </div>
        </div>

        {/* Report Type Tabs */}
        <div className="flex flex-wrap gap-2 mt-6">
          {reportTypes.map((report) => (
            <button
              key={report.id}
              onClick={() => setActiveReport(report.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeReport === report.id
                  ? darkMode
                    ? 'bg-emerald-600 text-white shadow-lg'
                    : 'bg-emerald-500 text-white shadow-lg'
                  : darkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <report.icon className="w-4 h-4" />
              {report.name}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Report */}
      {activeReport === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Revenue"
              value={formatCurrency(reportData.overview.totalRevenue)}
              icon={DollarSign}
              trend="up"
              trendValue={12.5}
              color="emerald"
            />
            <StatCard
              title="Net Profit"
              value={formatCurrency(reportData.overview.netProfit)}
              icon={TrendingUp}
              trend="up"
              trendValue={8.3}
              color="green"
            />
            <StatCard
              title="Total Orders"
              value={reportData.overview.totalOrders}
              icon={Package}
              trend="up"
              trendValue={5.2}
              color="blue"
            />
            <StatCard
              title="Active Staff"
              value={reportData.overview.activeStaff}
              icon={Users}
              color="purple"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue vs Expenses */}
            <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-6 border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Revenue vs Expenses
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Revenue</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(reportData.overview.totalRevenue)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Expenses</span>
                    <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      {formatCurrency(reportData.overview.totalExpenses)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full" style={{ width: `${(reportData.overview.totalExpenses / reportData.overview.totalRevenue) * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Net Profit</span>
                    <span className={`text-sm font-medium text-green-500`}>
                      {formatCurrency(reportData.overview.netProfit)}
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: `${(reportData.overview.netProfit / reportData.overview.totalRevenue) * 100}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Production Trend */}
            <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-6 border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Monthly Production (kg)
              </h3>
              <div className="flex items-end justify-between h-40 gap-2">
                {reportData.production.monthlyTrend.map((item, index) => (
                  <div key={index} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg transition-all duration-500 hover:from-emerald-500 hover:to-emerald-300"
                      style={{ height: `${(item.value / 16000) * 100}%` }}
                    ></div>
                    <span className={`text-xs mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{item.month}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Production Report */}
      {activeReport === 'production' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Latex (kg)"
              value={reportData.production.totalLatex.toLocaleString()}
              icon={Droplets}
              trend="up"
              trendValue={8.5}
              color="blue"
            />
            <StatCard
              title="Avg Yield/Tree (kg)"
              value={reportData.production.avgYieldPerTree}
              icon={Leaf}
              color="green"
            />
            <StatCard
              title="Active Plantations"
              value={reportData.production.activePlantations}
              icon={MapPin}
              color="emerald"
            />
            <StatCard
              title="Tapping Days"
              value={reportData.production.tappingDays}
              icon={Calendar}
              color="purple"
            />
          </div>

          {/* Production Chart */}
          <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-6 border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-6`}>
              Monthly Latex Production Trend
            </h3>
            <div className="flex items-end justify-between h-48 gap-3">
              {reportData.production.monthlyTrend.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1 group">
                  <div className={`text-xs mb-2 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {item.value.toLocaleString()} kg
                  </div>
                  <div 
                    className="w-full bg-gradient-to-t from-blue-600 to-cyan-400 rounded-t-lg transition-all duration-300 group-hover:from-blue-500 group-hover:to-cyan-300 cursor-pointer"
                    style={{ height: `${(item.value / 16000) * 100}%` }}
                  ></div>
                  <span className={`text-sm mt-3 font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Staff Performance Report */}
      {activeReport === 'staff' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total Staff"
              value={reportData.staff.totalStaff}
              icon={Users}
              color="purple"
            />
            <StatCard
              title="Active Tappers"
              value={reportData.staff.activeTappers}
              icon={Activity}
              color="green"
            />
            <StatCard
              title="Field Officers"
              value={reportData.staff.fieldOfficers}
              icon={MapPin}
              color="blue"
            />
            <StatCard
              title="Trainers"
              value={reportData.staff.trainers}
              icon={Users}
              color="orange"
            />
            <StatCard
              title="Avg Performance"
              value={`${reportData.staff.avgPerformance}%`}
              icon={TrendingUp}
              trend="up"
              trendValue={3.2}
              color="emerald"
            />
          </div>

          {/* Top Performers */}
          <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-6 border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Top Performers
            </h3>
            <div className="space-y-4">
              {reportData.staff.topPerformers.map((performer, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-4 rounded-xl ${
                    darkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{performer.name}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{performer.role}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                      {performer.score}%
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {performer.tasks} tasks
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Financial Report */}
      {activeReport === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown */}
            <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-6 border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Revenue Breakdown
              </h3>
              <div className="space-y-4">
                {reportData.financial.revenue.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.category}</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          index === 0 ? 'bg-emerald-500' : index === 1 ? 'bg-green-500' : index === 2 ? 'bg-teal-500' : 'bg-cyan-500'
                        }`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Revenue</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
                    {formatCurrency(reportData.financial.revenue.reduce((acc, item) => acc + item.amount, 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-6 border ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
                Expenses Breakdown
              </h3>
              <div className="space-y-4">
                {reportData.financial.expenses.map((item, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.category}</span>
                      <span className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {formatCurrency(item.amount)} ({item.percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          index === 0 ? 'bg-red-500' : index === 1 ? 'bg-orange-500' : index === 2 ? 'bg-yellow-500' : 'bg-pink-500'
                        }`} 
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className={`mt-6 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex justify-between">
                  <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Total Expenses</span>
                  <span className={`font-bold text-lg ${darkMode ? 'text-red-400' : 'text-red-600'}`}>
                    {formatCurrency(reportData.financial.expenses.reduce((acc, item) => acc + item.amount, 0))}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nursery Report */}
      {activeReport === 'nursery' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Saplings"
              value={reportData.nursery.totalSaplings.toLocaleString()}
              icon={Leaf}
              color="green"
            />
            <StatCard
              title="Sold This Month"
              value={reportData.nursery.soldThisMonth}
              icon={Package}
              trend="up"
              trendValue={15.2}
              color="emerald"
            />
            <StatCard
              title="Active Bookings"
              value={reportData.nursery.bookings}
              icon={Calendar}
              color="blue"
            />
            <StatCard
              title="Revenue"
              value={formatCurrency(reportData.nursery.revenue)}
              icon={DollarSign}
              trend="up"
              trendValue={12.8}
              color="teal"
            />
          </div>

          {/* Variety Breakdown Table */}
          <div className={`${darkMode ? 'bg-gray-800/80' : 'bg-white'} rounded-xl p-6 border ${
            darkMode ? 'border-gray-700' : 'border-gray-200'
          }`}>
            <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4`}>
              Variety-wise Stock & Sales
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                    <th className={`text-left py-3 px-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Variety
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Current Stock
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sold This Month
                    </th>
                    <th className={`text-right py-3 px-4 text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Stock Level
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.nursery.varietyBreakdown.map((variety, index) => (
                    <tr key={index} className={`border-b ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-4 px-4 font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {variety.variety}
                      </td>
                      <td className={`py-4 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {variety.stock.toLocaleString()}
                      </td>
                      <td className={`py-4 px-4 text-right ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        {variety.sold}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex justify-end">
                          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                (variety.stock / 5000) > 0.5 ? 'bg-green-500' : (variety.stock / 5000) > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${Math.min((variety.stock / 5000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl p-6 flex items-center gap-4`}>
              <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" />
              <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Generating report...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {notification.show && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-6 left-1/2 z-[100]"
          >
            <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
              notification.type === 'success'
                ? darkMode 
                  ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' 
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : darkMode
                  ? 'bg-red-900/90 border-red-500/50 text-red-100'
                  : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className={`p-2 rounded-full ${
                notification.type === 'success'
                  ? darkMode ? 'bg-emerald-500/20' : 'bg-emerald-100'
                  : darkMode ? 'bg-red-500/20' : 'bg-red-100'
              }`}>
                {notification.type === 'success' ? (
                  <CheckCircle className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
                ) : (
                  <AlertCircle className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">
                  {notification.type === 'success' ? 'Export Successful!' : 'Export Failed'}
                </p>
                <p className={`text-sm ${darkMode ? 'opacity-80' : 'opacity-70'}`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => setNotification({ show: false, message: '', type: 'success' })}
                className={`ml-2 p-1 rounded-full hover:bg-black/10 transition-colors`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Reports;

