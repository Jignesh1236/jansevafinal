
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, Download, Printer, Calendar, FileText, TrendingUp, TrendingDown, DollarSign, User, Lock } from "lucide-react";

interface Report {
  id: string;
  username: string;
  income: any[];
  deposit: any[];
  stamp: any[];
  balance: any[];
  mgvcl: any[];
  expences: any[];
  onlinePayment: any[];
  totals: any;
  timestamp: string;
}

const ViewReportsPage: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  
  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUsername, setCurrentUsername] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [loginError, setLoginError] = useState(false);

  useEffect(() => {
    if (isAuthenticated && currentUsername) {
      fetchUserReports();
    }
  }, [isAuthenticated, currentUsername]);

  useEffect(() => {
    if (isAuthenticated) {
      filterReports();
    }
  }, [reports, searchTerm, dateFilter]);

  const handleLogin = () => {
    if (!usernameInput.trim()) {
      setLoginError(true);
      return;
    }
    
    setCurrentUsername(usernameInput.trim());
    setIsAuthenticated(true);
    setLoginError(false);
    setLoading(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUsername("");
    setUsernameInput("");
    setReports([]);
    setFilteredReports([]);
    setError(null);
  };

  const filterReports = () => {
    let filtered = reports;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (report) =>
          report.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          new Date(report.timestamp).toLocaleDateString().includes(searchTerm)
      );
    }

    // Date filter
    if (dateFilter) {
      filtered = filtered.filter((report) => {
        const reportDate = new Date(report.timestamp).toISOString().split("T")[0];
        return reportDate === dateFilter;
      });
    }

    setFilteredReports(filtered);
  };

  const fetchUserReports = async () => {
    try {
      const response = await fetch("/api/reports");
      if (response.ok) {
        const data = await response.json();
        // Filter reports for the current user only
        const userReports = data.filter((report: Report) => 
          report.username && report.username.toLowerCase() === currentUsername.toLowerCase()
        );
        setReports(userReports);
        setFilteredReports(userReports);
      } else {
        setError("Failed to fetch reports");
      }
    } catch (err) {
      setError("Error fetching reports");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const calculateNetAmount = (report: Report) => {
    const totalAllIncome = (report.totals?.income || 0) + 
                          (report.totals?.deposit || 0) + 
                          (report.totals?.stamp || 0) + 
                          (report.totals?.balance || 0) + 
                          (report.totals?.mgvcl || 0) + 
                          (report.totals?.onlinePayment || 0);
    const totalExpenses = report.totals?.expences || 0;
    return totalAllIncome - totalExpenses;
  };

  const calculateServicesOnlyIncome = (report: Report) => {
    return report.totals?.income || 0;
  };

  const downloadReport = (report: Report) => {
    try {
      const csvData = [
        ["Section", "Item", "Amount", "Remark"],
        // Income Section
        ...(report.income || []).map((item) => [
          "Income",
          item.name || "",
          item.amount || 0,
          item.remark || "",
        ]),
        // Deposit Section
        ...(report.deposit || []).map((item) => [
          "Deposit",
          item.name || "",
          item.amount || 0,
          item.remark || "",
        ]),
        // Stamp Section
        ...(report.stamp || []).map((item) => [
          "Stamp",
          item.name || "",
          item.amount || 0,
          item.remark || "",
        ]),
        // Balance Section
        ...(report.balance || []).map((item) => [
          "Balance",
          item.name || "",
          item.amount || 0,
          item.remark || "",
        ]),
        // MGVCL Section
        ...(report.mgvcl || []).map((item) => [
          "MGVCL",
          item.name || "",
          item.amount || 0,
          item.remark || "",
        ]),
        // Expenses Section
        ...(report.expences || []).map((item) => [
          "Expenses",
          item.name || "",
          item.amount || 0,
          item.remark || "",
        ]),
        // Online Payment Section
        ...(report.onlinePayment || []).map((item) => [
          "Online Payment",
          item.name || "",
          item.amount || 0,
          item.remark || "",
        ]),
        // Summary
        ["", "", "", ""],
        ["Summary", "", "", ""],
        ["Income Total", "", report.totals?.income || 0, ""],
        ["Deposit Total", "", report.totals?.deposit || 0, ""],
        ["Stamp Total", "", report.totals?.stamp || 0, ""],
        ["Balance Total", "", report.totals?.balance || 0, ""],
        ["MGVCL Total", "", report.totals?.mgvcl || 0, ""],
        ["Online Payment Total", "", report.totals?.onlinePayment || 0, ""],
        ["Expenses Total", "", report.totals?.expences || 0, ""],
        ["Net Amount", "", calculateNetAmount(report), ""],
      ];

      const csvContent = csvData
        .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      const dataUri = "data:text/csv;charset=utf-8,\uFEFF" + encodeURIComponent(csvContent);

      const exportFileDefaultName = `report-${report.id.slice(0, 8)}-${new Date(report.timestamp).toISOString().split('T')[0]}.csv`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Error exporting report as Excel/CSV");
    }
  };

  const printReport = (report: Report) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const netAmount = calculateNetAmount(report);
      const reportDate = new Date(report.timestamp).toLocaleDateString('en-IN');
      
      printWindow.document.write(`
        <html>
          <head>
            <title>JANSEVA-2025 Daily Report</title>
            <style>
              body { 
                font-family: Arial, sans-serif; 
                margin: 20px; 
                color: #000; 
                font-size: 12px;
                line-height: 1.2;
              }
              .header { 
                text-align: center; 
                margin-bottom: 20px; 
              }
              .header h1 { 
                font-size: 16px; 
                margin: 5px 0; 
                font-weight: bold;
              }
              .header p { 
                margin: 2px 0; 
                font-size: 11px;
              }
              .report-date {
                text-align: right;
                margin-bottom: 10px;
                font-size: 11px;
              }
              table { 
                width: 100%; 
                border-collapse: collapse; 
                margin-bottom: 15px;
                font-size: 11px;
              }
              th, td { 
                border: 1px solid #000; 
                padding: 4px 6px; 
                text-align: left;
              }
              th { 
                background-color: #f0f0f0; 
                font-weight: bold;
                text-align: center;
              }
              .section-title { 
                font-weight: bold; 
                margin: 15px 0 5px 0;
                text-align: center;
              }
              .two-column { 
                display: flex; 
                gap: 20px; 
              }
              .column { 
                flex: 1; 
              }
              .amount { 
                text-align: right; 
              }
              .total-row { 
                font-weight: bold; 
                background-color: #f9f9f9;
              }
              .summary-box {
                border: 2px solid #000;
                padding: 10px;
                margin: 20px auto;
                width: 300px;
                text-align: center;
              }
              .summary-box h3 {
                margin: 0 0 10px 0;
                font-size: 14px;
              }
              .summary-line {
                display: flex;
                justify-content: space-between;
                margin: 5px 0;
                font-weight: bold;
              }
              .signature-section {
                margin-top: 40px;
                text-align: right;
              }
              @media print { 
                body { margin: 10px; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="report-date">${reportDate}, 5:03 PM</div>
            
            <div class="header">
              <p>JANSEVA-2025 Daily Report</p>
              <h1>JANSEVA-2025 (DAILY REPORT)</h1>
              <p>DATE: ${reportDate}</p>
              <p>USER: ${report.username}</p>
            </div>

            <div class="two-column">
              <div class="column">
                <div class="section-title">DEPOSIT AMOUNT (APEL RAKAM)</div>
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>PARTICULARE</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${report.deposit?.map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td class="amount">${(item.amount || 0).toFixed(2)}</td>
                      </tr>
                    `).join('') || ''}
                    <tr class="total-row">
                      <td colspan="2">TOTAL</td>
                      <td class="amount">${(report.totals?.deposit || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="section-title">STAMP PRINTING REPORT</div>
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>PARTICULARE</th>
                      <th>AMOUNT</th>
                      <th>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${report.stamp?.map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td class="amount">${(item.amount || 0).toFixed(2)}</td>
                        <td>${item.remark || ''}</td>
                      </tr>
                    `).join('') || ''}
                    <tr class="total-row">
                      <td colspan="3">TOTAL</td>
                      <td class="amount">${(report.totals?.stamp || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="section-title">INCOME</div>
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>SERVICE NAME</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${report.income?.slice(0, 10).map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td class="amount">${(item.amount || 0).toFixed(2)}</td>
                      </tr>
                    `).join('') || ''}
                    <tr class="total-row">
                      <td colspan="2">TOTAL</td>
                      <td class="amount">${(report.totals?.income || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="column">
                <div class="section-title">BALANCE (BACHAT RAKAM)</div>
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>PARTICULARE</th>
                      <th>AMOUNT</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${report.balance?.map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td class="amount">${(item.amount || 0).toFixed(2)}</td>
                      </tr>
                    `).join('') || ''}
                    <tr class="total-row">
                      <td colspan="2">TOTAL</td>
                      <td class="amount">${(report.totals?.balance || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="section-title">MGVCL REPORT</div>
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>PARTICULARE</th>
                      <th>AMOUNT</th>
                      <th>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${report.mgvcl?.map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td class="amount">${(item.amount || 0).toFixed(2)}</td>
                        <td>${item.remark || ''}</td>
                      </tr>
                    `).join('') || ''}
                    <tr class="total-row">
                      <td colspan="3">TOTAL</td>
                      <td class="amount">${(report.totals?.mgvcl || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="section-title">ONLINE PAYMENT</div>
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>PAYMENT METHOD</th>
                      <th>AMOUNT</th>
                      <th>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${report.onlinePayment?.map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td class="amount">${(item.amount || 0).toFixed(2)}</td>
                        <td>${item.remark || ''}</td>
                      </tr>
                    `).join('') || ''}
                    <tr class="total-row">
                      <td colspan="3">TOTAL</td>
                      <td class="amount">${(report.totals?.onlinePayment || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>

                <div class="section-title">EXPENCES</div>
                <table>
                  <thead>
                    <tr>
                      <th>NO</th>
                      <th>EXPENSE TYPE</th>
                      <th>AMOUNT</th>
                      <th>REMARK</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${report.expences?.filter(item => item.amount > 0 || item.name).map((item, index) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td class="amount">${(item.amount || 0).toFixed(2)}</td>
                        <td>${item.remark || ''}</td>
                      </tr>
                    `).join('') || ''}
                    <tr class="total-row">
                      <td colspan="3">TOTAL EXPENCES</td>
                      <td class="amount">${(report.totals?.expences || 0).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="summary-box">
              <div class="summary-line">
                <span>INCOME Total (Services):</span>
                <span>${(report.totals?.income || 0).toFixed(2)}</span>
              </div>
              <div class="summary-line">
                <span>ALL INCOME Total:</span>
                <span>${((report.totals?.income || 0) + (report.totals?.deposit || 0) + (report.totals?.stamp || 0) + (report.totals?.balance || 0) + (report.totals?.mgvcl || 0) + (report.totals?.onlinePayment || 0)).toFixed(2)}</span>
              </div>
              <div class="summary-line">
                <span>EXPENCES Total:</span>
                <span>${(report.totals?.expences || 0).toFixed(2)}</span>
              </div>
              <div class="summary-line" style="border-top: 1px solid #000; padding-top: 5px;">
                <span>Net Income:</span>
                <span>${netAmount.toFixed(2)}</span>
              </div>
            </div>

            <div class="signature-section">
              <p><strong>SUPERVISOR SIGN</strong></p>
              <br><br>
              <p>about blank</p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const openModal = (report: Report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedReport(null);
    setShowModal(false);
  };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">User Login</h1>
            <p className="text-gray-600">Enter your username to view your reports</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter your username"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loginError ? 'border-red-500' : 'border-gray-300'
                  }`}
                  value={usernameInput}
                  onChange={(e) => {
                    setUsernameInput(e.target.value);
                    setLoginError(false);
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                />
                <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              {loginError && (
                <p className="text-red-500 text-sm mt-1">Please enter a username</p>
              )}
            </div>

            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <Lock className="h-5 w-5" />
              <span>Login</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl font-semibold">{error}</p>
          <button
            onClick={fetchUserReports}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">My Reports</h1>
              <p className="text-gray-600">Welcome back, <span className="font-semibold text-blue-600">{currentUsername}</span></p>
            </div>
            <div className="flex space-x-3">
              <Link
                href="/report"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <FileText className="h-5 w-5" />
                <span>Create New Report</span>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search reports..."
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="relative">
                <input
                  type="date"
                  className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
            </div>
            
            <div className="mt-2 text-sm text-gray-600">
              Showing {filteredReports.length} of {reports.length} reports
            </div>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center bg-white rounded-xl shadow-lg p-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-2">
              {reports.length === 0 ? "No Reports Found" : "No Matching Reports"}
            </h3>
            <p className="text-gray-600 mb-6">
              {reports.length === 0 
                ? "Get started by creating your first financial report"
                : "Try adjusting your filters to find more reports"}
            </p>
            {reports.length === 0 ? (
              <Link
                href="/report"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Create Your First Report
              </Link>
            ) : (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setDateFilter("");
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => {
              const netAmount = calculateNetAmount(report);
              return (
                <div
                  key={report.id}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Report #{report.id.slice(0, 8)}...
                        </h3>
                        <div className="flex items-center text-blue-100">
                          <Calendar className="h-4 w-4 mr-2" />
                          <span className="text-sm">{formatDate(report.timestamp)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-blue-100">Net Amount</div>
                        <div className={`text-2xl font-bold ${netAmount >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                          ₹{netAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Cards */}
                  <div className="p-6">
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                          <div>
                            <div className="text-sm text-green-700 font-medium">Income (Services)</div>
                            <div className="text-lg font-bold text-green-800">
                              ₹{calculateServicesOnlyIncome(report).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <div className="flex items-center">
                          <TrendingDown className="h-5 w-5 text-red-600 mr-2" />
                          <div>
                            <div className="text-sm text-red-700 font-medium">Total Expenses</div>
                            <div className="text-lg font-bold text-red-800">
                              ₹{(report.totals?.expences || 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(report)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </button>
                      
                      <button
                        onClick={() => downloadReport(report)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download</span>
                      </button>
                      
                      <button
                        onClick={() => printReport(report)}
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Printer className="h-4 w-4" />
                        <span>Print</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal for viewing detailed report */}
        {showModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-xl">
                <h3 className="text-2xl font-semibold">
                  Detailed Report #{selectedReport.id.slice(0, 8)}...
                </h3>
                <button
                  onClick={closeModal}
                  className="text-white hover:text-gray-200 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600">Report ID</p>
                    <p className="font-medium text-lg">{selectedReport.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created Date</p>
                    <p className="font-medium text-lg">{formatDate(selectedReport.timestamp)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Created By</p>
                    <p className="font-medium text-lg">{selectedReport.username || 'Unknown User'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">Income (Services Only)</h4>
                    <p className="text-2xl font-bold text-green-600">
                      ₹{(selectedReport.totals?.income || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">Deposit</h4>
                    <p className="text-2xl font-bold text-blue-600">
                      ₹{(selectedReport.totals?.deposit || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">Stamp</h4>
                    <p className="text-2xl font-bold text-purple-600">
                      ₹{(selectedReport.totals?.stamp || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">Balance</h4>
                    <p className="text-2xl font-bold text-yellow-600">
                      ₹{(selectedReport.totals?.balance || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-2">MGVCL</h4>
                    <p className="text-2xl font-bold text-indigo-600">
                      ₹{(selectedReport.totals?.mgvcl || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
                    <h4 className="font-semibold text-teal-800 mb-2">Online Payment</h4>
                    <p className="text-2xl font-bold text-teal-600">
                      ₹{(selectedReport.totals?.onlinePayment || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">Total Expenses</h4>
                    <p className="text-2xl font-bold text-red-600">
                      ₹{(selectedReport.totals?.expences || 0).toFixed(2)}
                    </p>
                    <div className="mt-2 text-xs text-red-700">
                      {selectedReport.expences?.filter(item => item.amount > 0).length || 0} expense items
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Net Amount</h4>
                    <p className={`text-4xl font-bold ${calculateNetAmount(selectedReport) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ₹{calculateNetAmount(selectedReport).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={() => downloadReport(selectedReport)}
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Download className="h-5 w-5" />
                    <span>Download Report</span>
                  </button>
                  
                  <button
                    onClick={() => printReport(selectedReport)}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                  >
                    <Printer className="h-5 w-5" />
                    <span>Print Report</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewReportsPage;
