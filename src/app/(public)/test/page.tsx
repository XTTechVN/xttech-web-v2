'use client';

import api from '@/utils/api';

export default function TestPage() {
  const test = () => {
    api.post('/api/v1/auth/refresh', {}).then((response) => {
      console.log(response.data);
    });
  };

  return (
    <div className="bg-white h-screen flex justify-center items-center">
      <button className="bg-blue-500 px-4 py-2 text-white" onClick={test}>
        Test
      </button>
    </div>
  );
}
