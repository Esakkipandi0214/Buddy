import React, { useEffect, useState } from 'react';
import Dashboard from '../../components/Dashboard/dashboard';
import Layout from '@/components/staticComponents/layout';
import { useRouter } from 'next/router';
import checkUserExists from '../../utils/checkUserExists';
const Index = () => {
  const router = useRouter();
  const [access, setAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    redirect();
  }, [router]);
  
  const redirect =async() => {
     const userUid = localStorage.getItem("userUid")
      if (!userUid) {
        localStorage.clear()
        router.push("/")
        return
      }

      const exists = await checkUserExists(userUid)
      if (exists) {
        setAccess(true)
      } else {
        router.push("/")
      }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
       <div className="fixed inset-0 flex justify-center items-center bg-white/80 z-50">
    <div className="relative w-20 h-20">
      <div className="absolute inset-0 border-4 border-t-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      <div className="absolute inset-2 border-4 border-t-4 border-pink-500 border-t-transparent rounded-full animate-spin animation-delay-150"></div>
      <div className="absolute inset-4 border-4 border-t-4 border-indigo-500 border-t-transparent rounded-full animate-spin animation-delay-300"></div>
    </div>
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
