import React, { useEffect, useState } from 'react';
import ExpenseTracker from '@/components/Expenses/ExpenseTable';
import Layout from '@/components/staticComponents/layout';
import { useRouter } from 'next/router';

const Index = () => {
  const router = useRouter();
  const [access, setAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const userUid = localStorage.getItem('userUid');
    if (!userUid) {
      router.push('/'); // Redirect to home if no user UID found
    } else {
      setAccess(true); // Set access to true if user UID is found
    }
    setIsLoading(false); // Set loading to false after the check
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-green-400 to-purple-500 animate-pulse">
          Loading, Buddy...
        </p>
      </div>
    );
  }

  return (
    <>
      {access ? (
        <Layout>
          <ExpenseTracker />
        </Layout>
      ) : null}
    </>
  );
};

export default Index;
