
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Calculator } from "lucide-react";
import Link from "next/link";

const services = [
  "7/12 8-A",
  "1951 THI 7/12",
  "STAMP COMISSION",
  "PAN CARD",
  "AADHAR CARD",
  "LIGHT BILL",
  "AAYUSHMAN CARD",
  "PVC ORDER",
  "I KHEDUT ARJI",
  "E CHALLAN",
  "PM KISHAN & KYC",
  "INDEX",
  "VARSAI",
  "ELECTION CARD",
  "PARIVAHAN",
  "PF",
  "ONLINE FROME",
  "MGVCL ARJI",
  "LAMINATION & PRINT",
  "VADHARO",
];

const particulars = [
  "KAJAL-SBI-(STAMP)",
  "KAJAL-SBI-(ANYROR)",
  "JANSEVA KENDRA (PRIVATE) PAYMENT (STAMP)",
];

const stampParticulars = ["CSC ID (PRATIK)", "CSC ID (KAJAL)"];

const balanceParticulars = [
  "CSC WALLET BALANCE (PRATIK)",
  "CSC WALLET BALANCE (KAJAL)",
  "ANYROR BALANCE",
  "JANSEVA KENDRA (PRIVATE) ",
];

const mgvclParticulars = ["CSC ID (PRATIK)", "CSC ID (KAJAL)"];

const expencesParticulars = [
  "STAMP",
  "JANSEVA KENDRA (PRIVATE) MA BHARAVEL",
  "PVC ORDER",
  "ONLINE TRANSFER",
  "ANYROR MA BHARAVEL",
  "BANK EXPENCE",
  "OTHER EXPENSES",
];

const onlinePaymentParticulars = [
  "PHONEPE",
  "GOOGLE PAY",
  "PAYTM",
  "BANK TRANSFER",
  "UPI PAYMENT",
  "CREDIT CARD",
  "DEBIT CARD",
  "NET BANKING",
];

const NewReportPage: React.FC = () => {
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [canSubmitToday, setCanSubmitToday] = useState(true);
  const [todayReportExists, setTodayReportExists] = useState(false);
  const [adminPermissionRequested, setAdminPermissionRequested] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [username, setUsername] = useState("");
  const router = useRouter();

  React.useEffect(() => {
    checkTodayReport();
  }, []);

  const handlePasswordSubmit = async () => {
    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: passwordInput,
          page: 'report'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setIsAuthenticated(true);
        setPasswordError(false);
      } else {
        setPasswordError(true);
      }
    } catch (error) {
      console.error('Authentication error:', error);
      setPasswordError(true);
    }
  };

  const checkTodayReport = async () => {
    const today = new Date().toISOString().split('T')[0];
    
    try {
      const response = await fetch(`/api/reports/filtered?date=${today}`);
      if (response.ok) {
        const reports = await response.json();
        if (reports.length > 0) {
          setTodayReportExists(true);
          setCanSubmitToday(false);
        }
      }
    } catch (error) {
      console.error('Error checking today\'s report:', error);
    }
  };

  const requestAdminPermission = async () => {
    setAdminPermissionRequested(true);
    // In a real application, you would send a notification to admin
    alert('Admin permission request sent! Please wait for approval to submit another report today.');
  };

  const handleAmountChange = (key: string, value: string) => {
    setAmounts((prevAmounts) => ({
      ...prevAmounts,
      [key]: parseFloat(value) || 0,
    }));
  };

  const handleRemarkChange = (key: string, value: string) => {
    setRemarks((prevRemarks) => ({
      ...prevRemarks,
      [key]: value,
    }));
  };

  const calculateTotal = (items: string[], prefix: string) => {
    return items.reduce((sum, _, index) => {
      const key = `${prefix}-${index}`;
      return sum + (amounts[key] || 0);
    }, 0);
  };

  const incomeTotal = calculateTotal(services, "income");
  const depositTotal = calculateTotal(particulars, "deposit");
  const stampTotal = calculateTotal(stampParticulars, "stamp");
  const balanceTotal = calculateTotal(balanceParticulars, "balance");
  const mgvclTotal = calculateTotal(mgvclParticulars, "mgvcl");
  const expencesTotal = calculateTotal(expencesParticulars, "expences");
  const onlinePaymentTotal = calculateTotal(onlinePaymentParticulars, "onlinePayment");

  const handleSubmit = async () => {
    if (!canSubmitToday && !adminPermissionRequested) {
      alert('You have already submitted a report today. Please request admin permission to submit another report.');
      return;
    }

    if (!username.trim()) {
      alert('Please enter your username before submitting the report.');
      return;
    }

    setLoading(true);
    const reportData = {
      username: username.trim(),
      income: services.map((service, index) => ({
        name: service,
        amount: amounts[`income-${index}`] || 0,
      })),
      deposit: particulars.map((particular, index) => ({
        name: particular,
        amount: amounts[`deposit-${index}`] || 0,
      })),
      stamp: stampParticulars.map((particular, index) => ({
        name: particular,
        amount: amounts[`stamp-${index}`] || 0,
        remark: remarks[`stamp-${index}`] || "",
      })),
      balance: balanceParticulars.map((particular, index) => ({
        name: particular,
        amount: amounts[`balance-${index}`] || 0,
        remark: remarks[`balance-${index}`] || "",
      })),
      mgvcl: mgvclParticulars.map((particular, index) => ({
        name: particular,
        amount: amounts[`mgvcl-${index}`] || 0,
        remark: remarks[`mgvcl-${index}`] || "",
      })),
      expences: expencesParticulars.map((particular, index) => ({
        name: particular,
        amount: amounts[`expences-${index}`] || 0,
        remark: remarks[`expences-${index}`] || "",
      })),
      onlinePayment: onlinePaymentParticulars.map((particular, index) => ({
        name: particular,
        amount: amounts[`onlinePayment-${index}`] || 0,
        remark: remarks[`onlinePayment-${index}`] || "",
      })),
      totals: {
        income: incomeTotal,
        deposit: depositTotal,
        stamp: stampTotal,
        balance: balanceTotal,
        mgvcl: mgvclTotal,
        expences: expencesTotal,
        onlinePayment: onlinePaymentTotal,
      },
      timestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reportData),
      });

      if (response.ok) {
        alert("Report submitted successfully!");
        router.push("/reports/view");
      } else {
        alert("Failed to submit report.");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("An error occurred while submitting the report.");
    } finally {
      setLoading(false);
    }
  };

  const renderTable = (title: string, items: string[], prefix: string, showRemarks: boolean = false, bgColor: string = "bg-blue-50") => (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
      <div className={`${bgColor} px-6 py-4 border-b`}>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NO</th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {title.includes("INCOME") ? "SERVICE NAME" : title.includes("PAYMENT") ? "PAYMENT METHOD" : "PARTICULARE"}
              </th>
              <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">AMOUNT</th>
              {showRemarks && (
                <th className="py-3 px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">REMARK</th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {items.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="py-4 px-6 text-sm text-gray-900">{index + 1}</td>
                <td className="py-4 px-6 text-sm font-medium text-gray-900">{item}</td>
                <td className="py-4 px-6">
                  <input
                    type="number"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="₹ 0.00"
                    value={amounts[`${prefix}-${index}`] || ""}
                    onChange={(e) => handleAmountChange(`${prefix}-${index}`, e.target.value)}
                  />
                </td>
                {showRemarks && (
                  <td className="py-4 px-6">
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter remark"
                      value={remarks[`${prefix}-${index}`] || ""}
                      onChange={(e) => handleRemarkChange(`${prefix}-${index}`, e.target.value)}
                    />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td
                className="py-4 px-6 text-sm font-bold text-gray-900 text-right"
                colSpan={showRemarks ? 3 : 2}
              >
                Total Amount:
              </td>
              <td className="py-4 px-6 text-lg font-bold text-blue-600">
                ₹{calculateTotal(items, prefix).toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );

  // Password protection - show login form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Access Protected</h1>
            <p className="text-gray-600">Please enter the password to access the report page</p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setPasswordError(false);
                }}
                onKeyPress={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  passwordError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter password"
              />
              {passwordError && (
                <p className="text-red-500 text-sm mt-1">Incorrect password. Please try again.</p>
              )}
            </div>
            
            <button
              onClick={handlePasswordSubmit}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
              Access Report
            </button>
          </div>
          
          <div className="mt-6 text-center">
            <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-gray-800">
                <ArrowLeft className="h-6 w-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Create New Report</h1>
                <p className="text-gray-600">Fill in the financial details for your report</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calculator className="h-5 w-5 text-gray-500" />
                <span className="text-sm text-gray-500">
                  Total: ₹{(incomeTotal + depositTotal + stampTotal + balanceTotal + mgvclTotal + onlinePaymentTotal - expencesTotal).toFixed(2)}
                </span>
              </div>
              <Link
                href="/reports/view"
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                View Reports
              </Link>
              <Link
                href="/report/admin"
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Daily Report Restriction Warning */}
        {todayReportExists && !adminPermissionRequested && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-yellow-800">Daily Report Already Submitted</h3>
                <p className="text-yellow-700">You have already submitted a report today. You can request admin permission to submit another report.</p>
              </div>
              <button
                onClick={requestAdminPermission}
                className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded-lg"
              >
                Request Admin Permission
              </button>
            </div>
          </div>
        )}

        {adminPermissionRequested && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Admin Permission Requested</h3>
                <p className="text-sm text-blue-700">Your request has been sent to the admin. You can now submit another report.</p>
              </div>
            </div>
          </div>
        )}

        {renderTable("INCOME", services, "income", false, "bg-green-50")}
        {renderTable("DEPOSIT AMOUNT (APEL RAKAM)", particulars, "deposit", false, "bg-blue-50")}
        {renderTable("STAMP PRINTING REPORT", stampParticulars, "stamp", true, "bg-purple-50")}
        {renderTable("BALANCE (BACHAT RAKAM)", balanceParticulars, "balance", true, "bg-yellow-50")}
        {renderTable("MGVCL REPORT", mgvclParticulars, "mgvcl", true, "bg-indigo-50")}
        {renderTable("EXPENSES", expencesParticulars, "expences", true, "bg-red-50")}
        {renderTable("ONLINE PAYMENT", onlinePaymentParticulars, "onlinePayment", true, "bg-teal-50")}

        {/* Username Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="max-w-md mx-auto">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username (Required for submission)
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
            {!username.trim() && (
              <p className="text-red-500 text-sm mt-1">Username is required to submit the report</p>
            )}
          </div>
        </div>

        {/* Submit Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-green-600 font-medium">Total Income (Services Only)</p>
              <p className="text-2xl font-bold text-green-700">₹{incomeTotal.toFixed(2)}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-red-600 font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-700">₹{expencesTotal.toFixed(2)}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-600 font-medium">Net Amount (All Sources)</p>
              <p className="text-2xl font-bold text-blue-700">₹{(incomeTotal + depositTotal + stampTotal + balanceTotal + mgvclTotal + onlinePaymentTotal - expencesTotal).toFixed(2)}</p>
            </div>
          </div>
          
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={loading || (!canSubmitToday && !adminPermissionRequested) || !username.trim()}
          >
            <Save className="h-5 w-5" />
            <span>
              {loading ? "Submitting..." : 
               (!canSubmitToday && !adminPermissionRequested) ? "Daily Report Already Submitted" : 
               !username.trim() ? "Enter Username to Submit" :
               "Submit Report"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewReportPage;
