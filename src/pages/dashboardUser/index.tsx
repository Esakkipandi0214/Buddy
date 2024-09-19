import React, { useEffect, useState } from 'react';
import Dashboard from '../../components/Dashboard/dashboard';
import Layout from '@/components/staticComponents/layout';
import { useRouter } from 'next/router';

const Index = () => {
  const router = useRouter();
  const [access, setAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    redirect();
  }, [router]);
  
  const redirect = () => {
    const userUid = localStorage.getItem('userUid');
    if (!userUid) {
      setAccess(false);
      router.push('/');
    } else {
      setAccess(true);
    }
    setIsLoading(false);
  };

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
          <Dashboard />
        </Layout>
      ) : null}
    </>
  );
};

export default Index;
