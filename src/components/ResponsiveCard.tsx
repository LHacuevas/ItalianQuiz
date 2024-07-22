import React from 'react';
import Card, { CardProps } from '@mui/material/Card';
import Box, { BoxProps } from '@mui/material/Box';

interface ResponsiveCardProps extends CardProps {
  children: React.ReactNode;
  maxWidth?: string | { [key: string]: string | number };
}

const ResponsiveCard: React.FC<ResponsiveCardProps & BoxProps> = ({
  children,
  maxWidth = { xs: '100%', sm: '600px', md: '800px' },
  ...props
}) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', p: 0 }}>
      <Card
        sx={{
          width: '100%',
          maxWidth: maxWidth,
          mx: 'auto',
          p: 0,
          ...props.sx, // Asegúrate de que `sx` sea el tipo correcto
        }}
        {...props}
      >
        {children}
      </Card>
    </Box>
  );
};

export default ResponsiveCard;


