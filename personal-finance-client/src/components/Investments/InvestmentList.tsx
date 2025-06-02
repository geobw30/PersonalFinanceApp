import React from 'react';
import { Box, Typography } from '@mui/material';

const InvestmentList: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5">Investments</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        Investment management feature is coming soon.
      </Typography>
    </Box>
  );
};

export default InvestmentList; 