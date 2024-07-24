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

    // Prepare report data
    const reportData = [];
    let remainingBalance = 0;

    filteredIncomeDatas.forEach((incomeEntry) => {
      const incomeDate = incomeEntry.date;
      const incomeAmount = parseFloat(incomeEntry.amountInput);
      remainingBalance += incomeAmount;
      reportData.push([
        incomeDate,
        incomeEntry.source, // Add income source
        incomeAmount.toFixed(2),
        "",
        remainingBalance.toFixed(2),
      ]);
      filteredDatas.forEach((expenseEntry) => {
        if (
          expenseEntry.date === incomeDate ||
          expenseEntry.date > incomeDate
        ) {
          const expenseAmount = parseFloat(expenseEntry.amountInput);
          remainingBalance -= expenseAmount;
          reportData.push([
            expenseEntry.date,
            expenseEntry.nameInput, // Add expense name
            "",
            expenseAmount.toFixed(2),
            remainingBalance.toFixed(2),
          ]);
        }
      });
    });

    // Debugging: Check if reportData has content
    console.log("Filtered Income Data:", filteredIncomeDatas);
    console.log("Filtered Expense Data:", filteredDatas);
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
    <div className="container mx-auto p-4">
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>
        {!showIncomeInput && (
          <>
            <div className="mb-4 w-full max-w-sm">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Expense Name:
              </label>
              <input
                type="text"
                value={name}
                onChange={handleNameChange}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="mb-4 w-full max-w-sm">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Amount:
              </label>
              <input
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <button
              onClick={submitExpenseHandler}
              className="bg-blue-700 text-white font-bold px-4 py-2 rounded-md hover:bg-blue-800 w-full max-w-sm"
            >
              Add Expense
            </button>
          </>
        )}
        {!showIncomeInput && (
          <button
            onClick={toggleIncomeInput}
            className="bg-green-700 text-white font-bold px-4 py-2 rounded-md hover:bg-green-800 mt-4 w-full max-w-sm"
          >
            Add Income
          </button>
        )}
        {showIncomeInput && (
          <>
            <div className="mb-4 w-full max-w-sm mt-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Income Source:
              </label>
              <input
                type="text"
                value={incomeSource}
                onChange={handleIncomeSourceChange}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <div className="mb-4 w-full max-w-sm">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Income Amount:
              </label>
              <input
                type="number"
                value={income}
                onChange={handleIncomeChange}
                className="p-2 border border-gray-300 rounded-md w-full"
              />
            </div>
            <button
              onClick={submitIncomeHandler}
              className="bg-blue-700 text-white font-bold px-4 py-2 rounded-md hover:bg-blue-800 w-full max-w-sm"
            >
              Submit Income
            </button>
            <button
              onClick={toggleIncomeInput}
              className="bg-gray-700 text-white font-bold px-4 py-2 rounded-md hover:bg-gray-800 w-full max-w-sm mt-2"
            >
              Cancel Income Adding
            </button>
          </>
        )}
        <button
          onClick={clearHandler}
          className="bg-red-700 text-white font-bold px-4 py-2 rounded-md hover:bg-red-800 mt-4 w-full max-w-sm"
        >
          Clear All
        </button>
        <div className="mt-4 w-full max-w-sm">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Start Date:
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <div className="mt-4 w-full max-w-sm">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            End Date:
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="p-2 border border-gray-300 rounded-md w-full"
          />
        </div>
        <button
          onClick={generatePDF}
          className="bg-blue-700 text-white font-bold px-4 py-2 rounded-md hover:bg-blue-800 mt-4 w-full max-w-sm"
        >
          Generate PDF
        </button>
        <div className="mt-4">
          <h2 className="text-xl font-bold">
            Total Income: ₹{totalIncome.toFixed(2)}
          </h2>
          <h2 className="text-xl font-bold">
            Total Expenses: ₹{totalAmountSpent.toFixed(2)}
          </h2>
          <h2 className="text-xl font-bold">
            Remaining Balance: ₹{(totalIncome - totalAmountSpent).toFixed(2)}
          </h2>
        </div>
      </div>
    </div>
  );
}
