import React from 'react';
import styled from '@emotion/styled';
import useConfetti from '../hooks/useConfetti';

const StyledText = styled.span`
  cursor: pointer;
`;

const BrandText = ({ className }) => {
  const triggerConfetti = useConfetti();

  return (
    <StyledText onClick={triggerConfetti} className={className}>
      SastaShopping.com
    </StyledText>
  );
};

export default BrandText; 