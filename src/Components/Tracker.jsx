import React, { useState, useEffect } from "react";

export default function Tracker() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [datas, setDatas] = useState([]);
  const [totalAmountSpent, setTotalAmountSpent] = useState(0);

  useEffect(() => {
    const storedDatas = JSON.parse(localStorage.getItem("expenseDatas"));
    if (storedDatas && storedDatas.length > 0) {
      setDatas(storedDatas);
      const total = storedDatas.reduce(
        (acc, curr) => acc + parseFloat(curr.amountInput),
        0
      );
      setTotalAmountSpent(total);
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

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleAmountChange = (event) => {
    setAmount(event.target.value);
  };

  const submitHandler = () => {
    if (name.trim() === "" || amount.trim() === "") {
      alert("Please enter both name and amount.");
      return;
    }

    const inputObject = {
      nameInput: name,
      amountInput: amount,
    };

    setDatas([...datas, inputObject]);
    setName("");
    setAmount("");
  };

  const clearHandler = () => {
    setDatas([]);
    setName("");
    setAmount("");
    localStorage.removeItem("expenseDatas");
    setTotalAmountSpent(0);
  };

  return (
    <div>
      <div className="flex justify-center font-bold">
        <div className="text-white mb-6">
          Total Amount Spent: <span className="bg-purple-700 px-3 py-1 rounded-md">₹{totalAmountSpent.toFixed(2)}</span>
        </div>
      </div>
      <div className="Inputs flex flex-col gap-3 w-96">
        <input
          className="border-solid border-2 border-zinc-800 rounded-md pl-1 pt-3 pb-3"
          type="text"
          placeholder="Enter Expense Name..."
          value={name}
          onChange={handleNameChange}
        />
        <input
          className="border-solid border-2 border-zinc-800 rounded-md pl-1 pt-3 pb-3"
          type="number"
          placeholder="Enter Amount..."
          value={amount}
          onChange={handleAmountChange}
        />
      </div>

      <div className="Buttons flex flex-row gap-6 justify-center mt-4">
        <button
          className="bg-purple-700 text-white font-bold px-3 py-1 rounded-md"
          onClick={submitHandler}
        >
          Add Item
        </button>
        <button
          className="bg-purple-700 text-white font-bold px-3 py-1 rounded-md"
          onClick={clearHandler}
        >
          Clear All
        </button>
      </div>

      <div>
        {datas.map((data, index) => (
          <div
            key={index}
            className="border-solid border-2 border-zinc-800 rounded-md p-3 mt-4"
          >
            <p>Name: {data.nameInput}</p>
            <p>Amount: ₹{parseFloat(data.amountInput).toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
