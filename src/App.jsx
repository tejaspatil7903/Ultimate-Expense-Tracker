import React from 'react'
import Heading from './Components/Heading'
import Tracker from './Components/Tracker';

export default function App() {
  const Datas = [];
  return (
    <div className="flex flex-col h-screen w-[100%vw] items-center justify-center bg-gray-600">
      <Heading></Heading>
      <Tracker></Tracker>
    </div>
  );
}
