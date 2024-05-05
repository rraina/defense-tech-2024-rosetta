'use client';
import { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import Link from 'next/link';

export default function Home() {
  const [alertStatus1, setAlertStatus1] = useState(false);
  const [alertStatus2, setAlertStatus2] = useState(false);
  const [alertStatus3, setAlertStatus3] = useState(false);
  const [alertStatus4, setAlertStatus4] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        let response = await fetch(`https://2c3e0608831a.ngrok.app/channel/alerts`, {
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
        console.log("result is ", result);
        setAlertStatus1(result[1]);
        setAlertStatus2(result[2]);
        setAlertStatus3(result[3]);
        setAlertStatus4(result[3]);
      } catch (error) {
        console.error("Error during fetch:", error);
      }
    }

    fetchData();
  }, []); // The empty array ensures this effect runs only once after the initial render.

  const alertStyle = "flex rounded-2xl items-center font-bold justify-center text-2xl text-white bg-red-500 p-10 transition duration-300 ease-in-out transform hover:scale-105";
  const normalStyle = "flex rounded-2xl items-center font-bold justify-center text-2xl text-white bg-custom-gray-dark p-10 transition duration-300 ease-in-out transform hover:scale-105";
  const summarizationStyle = "flex rounded-2xl items-center font-bold justify-center text-2xl text-white bg-green-600 p-10 transition duration-300 ease-in-out transform hover:scale-105";

  return (
    <div className="container mx-auto box-border p-4 h-full w-full">
      <div className="h-full flex flex-col justify-between bg-custom-gray p-8 rounded-2xl">
        <h1 className="text-4xl font-bold mb-8 text-center text-white border-b-4 border-white pb-2">Channels</h1>
        {alertStatus1 ? (
          <div className={alertStyle}>
            <button onClick={() => router.push("/conversation/1_TAD_OBJ_A")}>1. TAD (Obj A)</button>
            {/* <Link href="/conversation/OperationId1">Ben Brian OperationId1</Link> */}
          </div>
        ) : (
          <div className={normalStyle}>
            <button onClick={() => router.push("/conversation/1_TAD_OBJ_A")}>1. TAD (Obj A)</button>
            {/* <Link href="/conversation/OperationId1">Ben Brian OperationId1</Link> */}
          </div>
        )}

        {alertStatus2 ? (
          <div className={alertStyle}>
            <Link href="/conversation/2_TAD_OBJ_B">2: TAD (Obj B)</Link>
          </div>
        ) : (
          <div className={normalStyle}>
            <Link href="/conversation/2_TAD_OBJ_B">2: TAD (Obj B)</Link>
          </div>
        )}

        {alertStatus3 ? (
          <div className={alertStyle}>
            <Link href="/conversation/3_TAOC">3: TAOC</Link>
          </div>
        ) : (
          <div className={normalStyle}>
            <Link href="/conversation/3_TAOC">3: TAOC</Link>
          </div>
        )}

        {alertStatus4 ? (
          <div className={alertStyle}>
            <Link href="/conversation/4_JSDF_BN_TAC">4: JSDF BN TAC</Link>
          </div>
        ) : (
          <div className={normalStyle}>
            <Link href="/conversation/4_JSDF_BN_TAC">4: JSDF BN TAC</Link>
          </div>
        )}
        <div className={summarizationStyle}>
          <button onClick={() => router.push("/summarize")}>Summarize</button>
          {/* <Link href="/summarize">Summarize</Link> */}
        </div>
      </div>
    </div>
  );
}
