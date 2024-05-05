'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="container mx-auto box-border p-4 h-full w-full">
      <div className="h-full flex flex-col justify-between">
        <div className="h-1/6 flex items-center justify-center font-bold rounded-2xl text-black bg-blue-400">
          <Link href="/conversation">Ben Brian OperationId1</Link>
        </div>
        <div className="h-1/6 flex items-center justify-center font-bold rounded-2xl text-black bg-blue-400">
          <Link href="/conversation">Ben Rahul OperationId2</Link>
        </div>
        <div className="h-1/6 flex items-center justify-center font-bold rounded-2xl text-black bg-blue-400">
          <Link href="/conversation">Rahul Shree OperationId3</Link>
        </div>
        <div className="h-1/6 flex items-center justify-center font-bold rounded-2xl text-black bg-blue-400">
          <Link href="/conversation">Abhishek Brian OperationId4</Link>
        </div>
        <div className="h-1/6 flex items-center justify-center font-bold rounded-2xl text-black bg-blue-400">
          <Link href="/summarize">Summarize</Link>
        </div>
      </div>
    </div>
  );
}
