import React, { useState, useEffect } from "react";

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

    const currentDate = new Date().toLocaleDateString();

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

    const currentDate = new Date().toLocaleDateString();

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

  const deleteExpenseHandler = (index) => {
    const updatedDatas = datas.filter((_, i) => i !== index);
    setDatas(updatedDatas);
  };

  const deleteIncomeHandler = (index) => {
    const updatedIncomeDatas = incomeDatas.filter((_, i) => i !== index);
    setIncomeDatas(updatedIncomeDatas);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Expense Tracker
        </h1>
        <div className="bg-green-100 text-green-700 p-2 rounded-md mb-2">
          Total Income:{" "}
          <span className="font-bold">₹{totalIncome.toFixed(2)}</span>
        </div>
        <div className="bg-purple-100 text-purple-700 p-2 rounded-md mb-2">
          Total Amount Spent:{" "}
          <span className="font-bold">₹{totalAmountSpent.toFixed(2)}</span>
        </div>
        <div className="bg-blue-100 text-blue-700 p-2 rounded-md">
          Remaining Balance:{" "}
          <span className="font-bold">
            ₹{(totalIncome - totalAmountSpent).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="w-full max-w-md">
          {!showIncomeInput && (
            <div className="bg-white p-4 rounded-md shadow-md mb-4">
              <input
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                type="text"
                placeholder="Enter Expense Name..."
                value={name}
                onChange={handleNameChange}
                disabled={totalIncome === 0}
              />
              <input
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                type="number"
                placeholder="Enter Amount..."
                value={amount}
                onChange={handleAmountChange}
                disabled={totalIncome === 0}
              />
            </div>
          )}
          {showIncomeInput && (
            <div className="bg-white p-4 rounded-md shadow-md mb-4">
              <input
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                type="number"
                placeholder="Enter Income Amount..."
                value={income}
                onChange={handleIncomeChange}
              />
              <input
                className="w-full border border-gray-300 rounded-md p-2 mb-2"
                type="text"
                placeholder="Enter Income Source..."
                value={incomeSource}
                onChange={handleIncomeSourceChange}
              />
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-2">
            {!showIncomeInput && (
              <button
                className={`w-full sm:w-auto bg-purple-700 text-white font-bold px-4 py-2 rounded-md hover:bg-purple-800 ${
                  totalIncome === 0 ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={submitExpenseHandler}
                disabled={totalIncome === 0}
              >
                Add Expense
              </button>
            )}
            <button
              className="w-full sm:w-auto bg-green-700 text-white font-bold px-4 py-2 rounded-md hover:bg-green-800"
              onClick={toggleIncomeInput}
            >
              {showIncomeInput ? "Hide Income Input" : "Add Income"}
            </button>
            {showIncomeInput && (
              <button
                className="w-full sm:w-auto bg-green-700 text-white font-bold px-4 py-2 rounded-md hover:bg-green-800"
                onClick={submitIncomeHandler}
              >
                Submit Income
              </button>
            )}
            <button
              className="w-full sm:w-auto bg-red-700 text-white font-bold px-4 py-2 rounded-md hover:bg-red-800"
              onClick={clearHandler}
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Expenses</h2>
        {datas.length === 0 && (
          <p className="text-gray-500">No expenses added yet.</p>
        )}
        <div className="grid gap-4">
          {datas.map((data, index) => (
            <div
              key={index}
              className="relative bg-white p-4 rounded-md shadow-md"
            >
              <button
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                onClick={() => deleteExpenseHandler(index)}
              >
                ×
              </button>
              <p className="font-bold">
                Name: <span className="text-gray-700">{data.nameInput}</span>
              </p>
              <p className="font-bold">
                Amount:{" "}
                <span className="text-gray-700">
                  ₹{parseFloat(data.amountInput).toFixed(2)}
                </span>
              </p>
              <p className="font-bold">
                Date: <span className="text-gray-700">{data.date}</span>
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Incomes</h2>
        {incomeDatas.length === 0 && (
          <p className="text-gray-500">No incomes added yet.</p>
        )}
        <div className="grid gap-4">
          {incomeDatas.map((incomeData, index) => (
            <div
              key={index}
              className="relative bg-white p-4 rounded-md shadow-md"
            >
              <button
                className="absolute top-2 right-2 text-red-600 hover:text-red-800"
                onClick={() => deleteIncomeHandler(index)}
              >
                ×
              </button>
              <p className="font-bold">
                Income Source:{" "}
                <span className="text-gray-700">{incomeData.source}</span>
              </p>
              <p className="font-bold">
                Income Amount:{" "}
                <span className="text-gray-700">
                  ₹{parseFloat(incomeData.amountInput).toFixed(2)}
                </span>
              </p>
              <p className="font-bold">
                Date: <span className="text-gray-700">{incomeData.date}</span>
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
