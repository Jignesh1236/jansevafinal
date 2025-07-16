"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

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

const ReportPage: React.FC = () => {
  const [amounts, setAmounts] = useState<{ [key: string]: number }>({});
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const language = "en";
  const t = {
    about: "About",
    services: "Services",
    contact: "Contact",
    visitCenter: "Visit Center",
    onlineTools: "Online Tools",
    ourServices: "Our Services",
    helpingYou: "Helping You",
    needAssistance: "Need Assistance",
    jansevakendra: "Janseva Kendra (Private)",
    offers: "Offers",
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
    setLoading(true);
    const reportData = {
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

    console.log("Submitting report data:", reportData);

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
        // Optionally reset the form here
        // setAmounts({});
        // setRemarks({});
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

  return (
    <>
      <div className="container mx-auto p-4 mb-8">
        <h1 className="text-3xl font-bold mb-6">INCOME</h1>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 border-b text-left">NO</th>
              <th className="py-3 px-4 border-b text-left">SERVICE NAME</th>
              <th className="py-3 px-4 border-b text-left">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-colors`}
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">{service}</td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter amount"
                    value={amounts[`income-${index}`] || ""}
                    onChange={(e) =>
                      handleAmountChange(`income-${index}`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="py-3 px-4 border-t font-bold text-right"
                colSpan={2}
              >
                Total
              </td>
              <td className="py-3 px-4 border-t font-bold">
                {incomeTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="container mx-auto p-4 mb-8">
        <h2 className="text-2xl font-bold mb-6">DEPOSIT AMOUNT (APEL RAKAM)</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden shadow-md">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 border-b text-left">NO</th>
              <th className="py-3 px-4 border-b text-left">PARTICULARE</th>
              <th className="py-3 px-4 border-b text-left">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {particulars.map((particular, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"} hover:bg-blue-50 transition-colors`}
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">{particular}</td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter amount"
                    value={amounts[`deposit-${index}`] || ""}
                    onChange={(e) =>
                      handleAmountChange(`deposit-${index}`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="py-3 px-4 border-t font-bold text-right"
                colSpan={2}
              >
                Total
              </td>
              <td className="py-3 px-4 border-t font-bold">
                {depositTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="container mx-auto p-4 mb-8">
        <h2 className="text-2xl font-bold mb-6">STAMP PRINTING REPORT</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 border-b text-left">NO</th>
              <th className="py-3 px-4 border-b text-left">PARTICULARE</th>
              <th className="py-3 px-4 border-b text-left">AMOUNT</th>
              <th className="py-3 px-4 border-b text-left">REMARK</th>
            </tr>
          </thead>
          <tbody>
            {stampParticulars.map((particular, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">{particular}</td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter amount"
                    value={amounts[`stamp-${index}`] || ""}
                    onChange={(e) =>
                      handleAmountChange(`stamp-${index}`, e.target.value)
                    }
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter remark"
                    value={remarks[`stamp-${index}`] || ""}
                    onChange={(e) =>
                      handleRemarkChange(`stamp-${index}`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="py-3 px-4 border-t font-bold text-right"
                colSpan={3}
              >
                Total
              </td>
              <td className="py-3 px-4 border-t font-bold">
                {stampTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="container mx-auto p-4 mb-8">
        <h2 className="text-2xl font-bold mb-6">BALANCE (BACHAT RAKAM)</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 border-b text-left">NO</th>
              <th className="py-3 px-4 border-b text-left">PARTICULARE</th>
              <th className="py-3 px-4 border-b text-left">AMOUNT</th>
              <th className="py-3 px-4 border-b text-left">REMARK</th>
            </tr>
          </thead>
          <tbody>
            {balanceParticulars.map((particular, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">{particular}</td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter amount"
                    value={amounts[`balance-${index}`] || ""}
                    onChange={(e) =>
                      handleAmountChange(`balance-${index}`, e.target.value)
                    }
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter remark"
                    value={remarks[`balance-${index}`] || ""}
                    onChange={(e) =>
                      handleRemarkChange(`balance-${index}`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="py-3 px-4 border-t font-bold text-right"
                colSpan={3}
              >
                Total
              </td>
              <td className="py-3 px-4 border-t font-bold">
                {balanceTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="container mx-auto p-4 mb-8">
        <h2 className="text-2xl font-bold mb-6">MGVCL REPORT</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 border-b text-left">NO</th>
              <th className="py-3 px-4 border-b text-left">PARTICULARE</th>
              <th className="py-3 px-4 border-b text-left">AMOUNT</th>
              <th className="py-3 px-4 border-b text-left">REMARK</th>
            </tr>
          </thead>
          <tbody>
            {mgvclParticulars.map((particular, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">{particular}</td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter amount"
                    value={amounts[`mgvcl-${index}`] || ""}
                    onChange={(e) =>
                      handleAmountChange(`mgvcl-${index}`, e.target.value)
                    }
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter remark"
                    value={remarks[`mgvcl-${index}`] || ""}
                    onChange={(e) =>
                      handleRemarkChange(`mgvcl-${index}`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="py-3 px-4 border-t font-bold text-right"
                colSpan={3}
              >
                Total
              </td>
              <td className="py-3 px-4 border-t font-bold">
                {mgvclTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="container mx-auto p-4 mb-8">
        <h2 className="text-2xl font-bold mb-6">EXPENCES</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 border-b text-left">NO</th>
              <th className="py-3 px-4 border-b text-left">SERVICE NAME</th>
              <th className="py-3 px-4 border-b text-left">AMOUNT</th>
              <th className="py-3 px-4 border-b text-left">REMARK</th>
            </tr>
          </thead>
          <tbody>
            {expencesParticulars.map((particular, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">{particular}</td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter amount"
                    value={amounts[`expences-${index}`] || ""}
                    onChange={(e) =>
                      handleAmountChange(`expences-${index}`, e.target.value)
                    }
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter remark"
                    value={remarks[`expences-${index}`] || ""}
                    onChange={(e) =>
                      handleRemarkChange(`expences-${index}`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="py-3 px-4 border-t font-bold text-right"
                colSpan={3}
              >
                Total
              </td>
              <td className="py-3 px-4 border-t font-bold">
                {expencesTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="container mx-auto p-4 mb-8">
        <h2 className="text-2xl font-bold mb-6">ONLINE PAYMENT</h2>
        <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gray-200">
              <th className="py-3 px-4 border-b text-left">NO</th>
              <th className="py-3 px-4 border-b text-left">PAYMENT METHOD</th>
              <th className="py-3 px-4 border-b text-left">AMOUNT</th>
              <th className="py-3 px-4 border-b text-left">REMARK</th>
            </tr>
          </thead>
          <tbody>
            {onlinePaymentParticulars.map((particular, index) => (
              <tr
                key={index}
                className={`${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
              >
                <td className="py-3 px-4 border-b">{index + 1}</td>
                <td className="py-3 px-4 border-b">{particular}</td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="number"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter amount"
                    value={amounts[`onlinePayment-${index}`] || ""}
                    onChange={(e) =>
                      handleAmountChange(`onlinePayment-${index}`, e.target.value)
                    }
                  />
                </td>
                <td className="py-3 px-4 border-b">
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded"
                    placeholder="Enter remark"
                    value={remarks[`onlinePayment-${index}`] || ""}
                    onChange={(e) =>
                      handleRemarkChange(`onlinePayment-${index}`, e.target.value)
                    }
                  />
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                className="py-3 px-4 border-t font-bold text-right"
                colSpan={3}
              >
                Total
              </td>
              <td className="py-3 px-4 border-t font-bold">
                {onlinePaymentTotal.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="container mx-auto p-4 mt-8 flex justify-center space-x-4">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          onClick={handleSubmit}
          disabled={loading}
        >
          Submit Report
        </button>
      </div>
    </>
  );
};

export default ReportPage;
