'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  // let alert_status = false;
  // try {
  //   // Send a POST request with the audio file
  //   let response = await fetch(`https://2c3e0608831a.ngrok.app/channel/1/alert`, {
  //       method: "GET",
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Accept': 'application/json',
  //         'ngrok-skip-browser-warning': 'true',
  //       }
  //   });

  //   // Return the response JSON if successful
  //   let result = await response.json();  
  //   alert_status = result.alert_status;

  // } catch (error) {
  //   console.error("Error summarizing.", error);
  // }
  const [alertStatus, setAlertStatus] = useState(false);
  const [alertStatus2, setAlertStatus2] = useState(false);
  const [alertStatus3, setAlertStatus3] = useState(false);
  const [alertStatus4, setAlertStatus4] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        let response = await fetch(`https://2c3e0608831a.ngrok.app/channel/1/alert`, {
          method: "GET",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'ngrok-skip-browser-warning': 'true',
          }
        });
        if (!response.ok) {
          throw new Error("Network response was not OK");
        }
        let result = await response.json();
        console.log("result is ");
        console.log(result);
        setAlertStatus(result.alert_status);
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    }

    fetchData();
  }, []); // The empty array ensures this effect runs only once after the initial render.

  return (
    <div className="container mx-auto box-border p-4 h-full w-full">
      <div className="h-full flex flex-col justify-between bg-custom-gray p-8 rounded-2xl">
        {alertStatus ? (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-red-500">
          <Link href="/conversation/OperationId1">Ben Brian OperationId1</Link>
        </div>):
        (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-custom-gray-dark">
          <Link href="/conversation/OperationId1">Ben Brian OperationId1</Link>
        </div>)}
        {alertStatus2 ? (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-red-500">
          <Link href="/conversation/OperationId2">Ben Rahul OperationId2</Link>
        </div>):
        (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-custom-gray-dark">
          <Link href="/conversation/OperationId2">Ben Rahul OperationId2</Link>
        </div>)}
        {alertStatus3 ? (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-red-500">
          <Link href="/conversation/OperationId3">Rahul Shree OperationId3</Link>
        </div>):
        (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-custom-gray-dark">
          <Link href="/conversation/OperationId3">Rahul Shree OperationId3</Link>
        </div>)}
        {alertStatus4 ? (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-red-500">
          <Link href="/conversation/OperationId4">Abhishek Brian OperationId4</Link>
        </div>):
        (<div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-custom-gray-dark">
          <Link href="/conversation/OperationId4">Abhishek Brian OperationId4</Link>
        </div>)}

        <div className="h-1/6 flex items-center justify-center text-lg rounded-2xl text-white bg-custom-gray-dark">
          <Link href="/summarize">Summarize</Link>
        </div>
      </div>
    </div>
  );
}
