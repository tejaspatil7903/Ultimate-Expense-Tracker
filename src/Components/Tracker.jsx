import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

export default function Tracker() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [datas, setDatas] = useState([]);
  const [totalAmountSpent, setTotalAmountSpent] = useState(0);
  const [income, setIncome] = useState("");
  const [incomeSource, setIncomeSource] = useState("");
  const [totalIncome, setTotalIncome] = useState(0);
  const [incomeDatas, setIncomeDatas] = useState([]);
  const [showIncomeInput, setShowIncomeInput] = useState(false);
  const [entriesByDate, setEntriesByDate] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    const storedDatas = JSON.parse(localStorage.getItem("expenseDatas"));
    const storedIncomeDatas = JSON.parse(localStorage.getItem("incomeDatas"));
    const storedIncome = JSON.parse(localStorage.getItem("totalIncome"));
    if (storedDatas && storedDatas.length > 0) {
      setDatas(storedDatas);
      const total = storedDatas.reduce(
        (acc, curr) => acc + parseFloat(curr.amountInput),
        0
      );
      setTotalAmountSpent(total);
      const groupedByDate = storedDatas.reduce((acc, data) => {
        if (!acc[data.date]) acc[data.date] = [];
        acc[data.date].push(data);
        return acc;
      }, {});
      setEntriesByDate(groupedByDate);
    }
    if (storedIncomeDatas && storedIncomeDatas.length > 0) {
      setIncomeDatas(storedIncomeDatas);
    }
    if (storedIncome) {
      setTotalIncome(storedIncome);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("expenseDatas", JSON.stringify(datas));
    const total = datas.reduce(
      (acc, curr) => acc + parseFloat(curr.amountInput),
      0
    );
    setTotalAmountSpent(total);
    const groupedByDate = datas.reduce((acc, data) => {
      if (!acc[data.date]) acc[data.date] = [];
      acc[data.date].push(data);
      return acc;
    }, {});
    setEntriesByDate(groupedByDate);
  }, [datas]);

  useEffect(() => {
    localStorage.setItem("incomeDatas", JSON.stringify(incomeDatas));
  }, [incomeDatas]);

  useEffect(() => {
    localStorage.setItem("totalIncome", JSON.stringify(totalIncome));
  }, [totalIncome]);

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const handleIncomeChange = (event) => {
    setIncome(event.target.value);
  };

  const handleIncomeSourceChange = (event) => {
    setIncomeSource(event.target.value);
  };

  const submitExpenseHandler = () => {
    if (name.trim() === "" || amount.trim() === "") {
      alert("Please enter both name and amount.");
      return;
    }

    if (totalIncome - totalAmountSpent <= 0) {
      alert(
        "Your balance is zero. Please add more income before adding additional expenses."
      );
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const inputObject = {
      nameInput: name,
      amountInput: amount,
      date: currentDate,
    };

    setDatas([...datas, inputObject]);
    setName("");
    setAmount("");
  };

  const submitIncomeHandler = () => {
    if (income.trim() === "" || incomeSource.trim() === "") {
      alert("Please enter both income amount and source.");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

    const incomeObject = {
      amountInput: income,
      source: incomeSource,
      date: currentDate,
    };

    setIncomeDatas([...incomeDatas, incomeObject]);
    setTotalIncome(totalIncome + parseFloat(income));
    setIncome("");
    setIncomeSource("");
    setShowIncomeInput(false);
  };

  const toggleIncomeInput = () => {
    setShowIncomeInput(!showIncomeInput);
  };

  const clearHandler = () => {
    setDatas([]);
    setIncomeDatas([]);
    setName("");
    setAmount("");
    setIncome("");
    setIncomeSource("");
    localStorage.removeItem("expenseDatas");
    localStorage.removeItem("incomeDatas");
    localStorage.removeItem("totalIncome");
    setTotalAmountSpent(0);
    setTotalIncome(0);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Filter data based on the selected date range
    const filteredDatas = datas.filter((data) => {
      const date = new Date(data.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const filteredIncomeDatas = incomeDatas.filter((data) => {
      const date = new Date(data.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    // Combine filtered income and expense entries while preserving their input order
    const combinedEntries = [
      ...filteredIncomeDatas.map((entry) => ({
        ...entry,
        type: "income",
      })),
      ...filteredDatas.map((entry) => ({
        ...entry,
        type: "expense",
      })),
    ];

    // Prepare report data
    const reportData = [];
    let remainingBalance = 0;

    combinedEntries.forEach((entry) => {
      if (entry.type === "income") {
        const incomeAmount = parseFloat(entry.amountInput);
        remainingBalance += incomeAmount;
        reportData.push([
          entry.date,
          entry.source, // Add income source
          `₹${incomeAmount.toFixed(2)}`,
          "",
          `₹${remainingBalance.toFixed(2)}`,
        ]);
      } else if (entry.type === "expense") {
        const expenseAmount = parseFloat(entry.amountInput);
        remainingBalance -= expenseAmount;
        reportData.push([
          entry.date,
          entry.nameInput, // Add expense name
          "",
          `₹${expenseAmount.toFixed(2)}`,
          `₹${remainingBalance.toFixed(2)}`,
        ]);
      }
    });

    // Debugging: Check if reportData has content
    console.log("Report Data:", reportData);

    if (reportData.length === 0) {
      doc.text("No data available for the selected date range.", 10, 10);
    } else {
      doc.autoTable({
        head: [
          ["Date", "Source/Name", "Income", "Expenses", "Remaining Balance"],
        ],
        body: reportData,
      });
    }

    // Save the PDF
    doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
  };

  return (
    <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
        Expense Tracker
      </h1>
      <div className="flex flex-col items-center">
        {!showIncomeInput ? (
          <>
            <div className="mb-6 w-full max-w-sm bg-white p-4 rounded-lg shadow-md">
              <label className="block text-gray-800 text-sm font-semibold mb-2">
                Expense Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6 w-full max-w-sm bg-white p-4 rounded-lg shadow-md">
              <label className="block text-gray-800 text-sm font-semibold mb-2">
                Amount:
              </label>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={submitExpenseHandler}
              className="bg-blue-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 w-full max-w-sm"
            >
              Add Expense
            </button>
            <button
              onClick={toggleIncomeInput}
              className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 mt-4 w-full max-w-sm"
            >
              Add Income
            </button>
          </>
        ) : (
          <>
            <div className="mb-6 w-full max-w-sm bg-white p-4 rounded-lg shadow-md">
              <label className="block text-gray-800 text-sm font-semibold mb-2">
                Income Source:
              </label>
              <input
                type="text"
                value={incomeSource}
                onChange={handleIncomeSourceChange}
                className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="mb-6 w-full max-w-sm bg-white p-4 rounded-lg shadow-md">
              <label className="block text-gray-800 text-sm font-semibold mb-2">
                Amount:
              </label>
              <input
                type="number"
                value={income}
                onChange={handleIncomeChange}
                className="p-3 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={submitIncomeHandler}
              className="bg-green-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 w-full max-w-sm"
            >
              Add Income
            </button>
            <button
              onClick={toggleIncomeInput}
              className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300 mt-4 w-full max-w-sm"
            >
              Cancel Income Adding
            </button>
          </>
        )}
        <div className="mt-6 flex flex-col items-center">
          <button
            onClick={clearHandler}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-red-700 transition duration-300 mb-4"
          >
            Clear All
          </button>
          <div className="mb-4 text-lg font-semibold">
            Total Income: ₹{totalIncome.toFixed(2)}
          </div>
          <div className="mb-4 text-lg font-semibold">
            Total Expenses: ₹{totalAmountSpent.toFixed(2)}
          </div>
          <div className="mb-4 text-lg font-semibold">
            Remaining Balance: ₹{(totalIncome - totalAmountSpent).toFixed(2)}
          </div>
          <label className="block text-gray-800 text-sm font-semibold mb-2">
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-3 border border-gray-300 rounded-md mb-4 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <label className="block text-gray-800 text-sm font-semibold mb-2">
            End Date:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-3 border border-gray-300 rounded-md mb-4 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={generatePDF}
            className="bg-indigo-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300"
          >
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
}
