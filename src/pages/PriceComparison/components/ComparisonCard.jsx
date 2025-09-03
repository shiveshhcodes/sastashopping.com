import React from 'react';
import styled, { css, keyframes } from 'styled-components';

const PLATFORM_STYLES = {
  amazon: { color: '#FF9900', label: 'Amazon', logo: '/images/amazon-logo.png', description: 'Shop on Amazon India for the best deals and fast delivery.' },
  flipkart: { color: '#2874F0', label: 'Flipkart', logo: '/images/flipkart-logo.png', description: 'Find great offers and exclusive products on Flipkart.' },
  myntra: { color: '#FF3F6C', label: 'Myntra', logo: '/images/myntra-logo.png', description: 'Discover the latest fashion and trends on Myntra.' },
};

const pulse = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
`;

const Card = styled.div`
  background: #fff;
  border: 2.5px solid #ece9fc;
  border-radius: 2rem;
  box-shadow: 0 4px 32px rgba(108,92,231,0.07);
  min-width: 260px;
  max-width: 340px;
  flex: 1 1 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2.2rem 1.5rem 1.7rem 1.5rem;
  margin-bottom: 1.5rem;
  transition: box-shadow 0.18s, border-color 0.18s, transform 0.18s;
  background: #fcfbff;
  &:hover {
    box-shadow: 0 8px 40px rgba(108,92,231,0.13);
    border-color: #bdb4f6;
    transform: translateY(-4px) scale(1.025);
  }
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.2rem;
`;

const Logo = styled.img`
  width: 54px;
  height: 54px;
  object-fit: contain;
  margin-bottom: 0.7rem;
  background: #f3f0ff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(108,92,231,0.07);
  padding: 0.5rem;
`;

const PlatformLabel = styled.span`
  font-size: 1.18rem;
  font-weight: 800;
  margin-bottom: 0.2rem;
  letter-spacing: -0.5px;
  font-family: inherit;
  color: ${({ color }) => color};
`;

const Thumb = styled.div`
  width: 90px;
  height: 90px;
  background: #f7f8fa;
  border-radius: 1.2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.8rem;
  box-shadow: 0 2px 8px rgba(108,92,231,0.04);
  img {
    max-width: 80px;
    max-height: 80px;
    object-fit: contain;
    border-radius: 1rem;
  }
`;

const ThumbPlaceholder = styled.div`
  width: 80px;
  height: 80px;
  background: #ece9fc;
  border-radius: 1rem;
  animation: ${pulse} 1.2s infinite ease-in-out;
`;

const Title = styled.div`
  font-size: 1.13rem;
  font-weight: 700;
  color: #23213a;
  margin-bottom: 0.4rem;
  text-align: center;
  min-height: 2.2em;
  font-family: inherit;
`;

const Price = styled.div`
  font-size: 1.32rem;
  font-weight: 800;
  color: #6c5ce7;
  margin-bottom: 0.4rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CheapestTag = styled.span`
  background: #1a8917;
  color: #fff;
  font-size: 0.98rem;
  font-weight: 700;
  border-radius: 0.8rem;
  padding: 0.15rem 0.8rem;
  margin-left: 0.5rem;
  letter-spacing: 0.01em;
  box-shadow: 0 1px 4px rgba(26,137,23,0.08);
`;

const Desc = styled.div`
  font-size: 1.01rem;
  color: #666;
  margin-bottom: 0.9rem;
  text-align: center;
  min-height: 2.1em;
  font-family: inherit;
`;

const Link = styled.a`
  margin-top: 0.8rem;
  color: #6c5ce7;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.11rem;
  border-radius: 1rem;
  padding: 0.6rem 1.3rem;
  background: #f3f0ff;
  transition: background 0.18s, color 0.18s;
  display: inline-block;
  box-shadow: 0 1px 4px rgba(108,92,231,0.07);
  &:hover {
    background: #ece9fc;
    color: #4b3bbd;
  }
`;

const SkeletonText = styled.span`
  display: inline-block;
  height: 1.1em;
  width: 70%;
  background: #ece9fc;
  border-radius: 0.5em;
  animation: ${pulse} 1.2s infinite ease-in-out;
`;

const ComparisonCard = ({ platform, loading, data, isCheapest, error }) => {
  const style = PLATFORM_STYLES[platform];
  return (
    <Card style={{ borderColor: style.color }}>
      <Header>
        {style.logo && <Logo src={style.logo} alt={style.label} />}
        <PlatformLabel color={style.color}>{style.label}</PlatformLabel>
      </Header>
      <div>
        {loading ? (
          <Thumb><ThumbPlaceholder /></Thumb>
        ) : (
          <Thumb>
            {data?.thumbnail ? <img src={data.thumbnail} alt={data.title} /> : <ThumbPlaceholder />}
          </Thumb>
        )}
        <Title>{loading ? <SkeletonText /> : (data?.title || error || 'No data')}</Title>
        <Price>
          {loading ? <SkeletonText /> : (
            <>
              <span>{data?.price || '-'}</span>
              {isCheapest && !loading && <CheapestTag>CHEAPEST</CheapestTag>}
            </>
          )}
        </Price>
        <Desc>{style.description}</Desc>
      </div>
      <Link href={data?.link || '#'} target="_blank" rel="noopener noreferrer">
        View on {style.label}
      </Link>
    </Card>
  );
};

export default ComparisonCard; 