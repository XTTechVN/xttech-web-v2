import { Suspense } from 'react';

import { EmployeeTabs } from './_components';

const Page = () => (
  <div className="p-4 md:p-6">
    <Suspense fallback={null}>
      <EmployeeTabs />
    </Suspense>
  </div>
);

export default Page;
