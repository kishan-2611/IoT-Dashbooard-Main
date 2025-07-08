'use client'; // ✅ Mark this as a client component

import * as React from 'react';
import { Stack } from '@mui/system';
import Dashboard from '@/components/dashboard/overview/dashboard';

export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Dashboard />
    </Stack>
  );
}
