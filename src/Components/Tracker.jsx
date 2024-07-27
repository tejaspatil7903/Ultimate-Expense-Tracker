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

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const submitExpenseHandler = () => {
    if (name.trim() === "" || amount.trim() === "") {
      alert("Please enter both name and amount.");
      return;
    }

    const expenseAmount = parseFloat(amount);

    if (totalIncome - totalAmountSpent < expenseAmount) {
      alert("Cannot add expense as it exceeds the remaining balance.");
      return;
    }

    const currentDate = new Date().toISOString().split("T")[0];

    const inputObject = {
      nameInput: name,
      amountInput: amount,
      date: currentDate,
      timestamp: new Date().getTime(),
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

    const currentDate = new Date().toISOString().split("T")[0];

    const incomeObject = {
      amountInput: income,
      source: incomeSource,
      date: currentDate,
      timestamp: new Date().getTime(),
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

    // Filter entries by date range
    const filteredDatas = datas.filter((data) => {
      const date = new Date(data.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    const filteredIncomeDatas = incomeDatas.filter((data) => {
      const date = new Date(data.date);
      return date >= new Date(startDate) && date <= new Date(endDate);
    });

    // Combine both income and expense entries into a single list
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

    // Sort entries by timestamp to maintain input order
    combinedEntries.sort((a, b) => a.timestamp - b.timestamp);

    // Prepare data for PDF
    const reportData = [];
    let remainingBalance = 0;

    combinedEntries.forEach((entry) => {
      if (entry.type === "income") {
        const incomeAmount = parseFloat(entry.amountInput || entry.amount);
        remainingBalance += incomeAmount;
        reportData.push([
          formatDate(entry.date),
          entry.source || "", // Income source
          incomeAmount.toFixed(2),
          "",
          remainingBalance.toFixed(2),
        ]);
      } else if (entry.type === "expense") {
        const expenseAmount = parseFloat(entry.amountInput);
        remainingBalance -= expenseAmount;
        reportData.push([
          formatDate(entry.date),
          entry.nameInput || "", // Expense name
          "",
          expenseAmount.toFixed(2),
          remainingBalance.toFixed(2),
        ]);
      }
    });

    if (reportData.length === 0) {
      doc.text("No data available for the selected date range.", 10, 10);
    } else {
      doc.autoTable({
        head: [
          ["Date", "Source/Name", "Income", "Expenses", "Remaining Balance"],
        ],
        body: reportData,
        styles: {
          halign: "right",
        },
      });
    }

    doc.save(`Expense_Report_${startDate}_to_${endDate}.pdf`);
  };

  const formatDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md space-y-4">
      <h1 className="text-2xl font-bold text-center mb-6">Expense Tracker</h1>
      <div className="mb-4">
        <label className="block font-bold mb-2">Expense Name:</label>
        <input
          type="text"
          value={name}
          onChange={handleNameChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block font-bold mb-2">Expense Amount:</label>
        <input
          type="number"
          value={amount}
          onChange={handleAmountChange}
          className="w-full p-2 border rounded"
        />
      </div>
      <button
        onClick={submitExpenseHandler}
        className="w-full p-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-700"
      >
        Add Expense
      </button>
      {showIncomeInput && (
        <>
          <div className="mt-4">
            <label className="block font-bold mb-2">Income Amount:</label>
            <input
              type="number"
              value={income}
              onChange={handleIncomeChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block font-bold mb-2">Income Source:</label>
            <input
              type="text"
              value={incomeSource}
              onChange={handleIncomeSourceChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <button
            onClick={submitIncomeHandler}
            className="w-full p-2 bg-green-500 text-white font-bold rounded hover:bg-green-700"
          >
            Add Income
          </button>
          <button
            onClick={toggleIncomeInput}
            className="w-full mt-2 p-2 bg-red-500 text-white font-bold rounded hover:bg-red-700"
          >
            Cancel Income Adding
          </button>
        </>
      )}
      {!showIncomeInput && (
        <button
          onClick={toggleIncomeInput}
          className="w-full p-2 bg-green-500 text-white font-bold rounded hover:bg-green-700"
        >
          Add Income
        </button>
      )}
      <button
        onClick={clearHandler}
        className="w-full p-2 bg-red-500 text-white font-bold rounded hover:bg-red-700"
      >
        Clear All
      </button>
      <div className="mt-4 flex flex-col gap-4">
        <button
          onClick={generatePDF}
          className="w-full p-2 bg-yellow-500 text-white font-bold rounded hover:bg-yellow-700"
        >
          Generate PDF
        </button>
        <div className="flex gap-4">
          <div className="w-1/2">
            <label className="block mb-2">Start Date:</label>
            <input
              type="date"
              value={startDate}
              onChange={handleStartDateChange}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="w-1/2">
            <label className="block mb-2">End Date:</label>
            <input
              type="date"
              value={endDate}
              onChange={handleEndDateChange}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 border-t pt-4 text-center">
        <h2 className="text-xl font-bold">Summary</h2>
        <div className="mt-2 text-lg">
          <p>Total Expenses: ₹{totalAmountSpent.toFixed(2)}</p>
          <p>Total Income: ₹{totalIncome.toFixed(2)}</p>
          <p>
            Remaining Balance: ₹{(totalIncome - totalAmountSpent).toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
