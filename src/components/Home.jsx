import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAIPublicationStats } from '../redux/features/aiStatsSlice';
import HeroSection from './HeroSection';
import PublicationStatsSection from './PublicationStatsSection';
import FeaturedResourcesSection from './FeaturedResourcesSection';
import CTASection from './CTASection';

const Home = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAIPublicationStats());
  }, [dispatch]);

  return (
    <>
      <HeroSection />
      <FeaturedResourcesSection />
      <PublicationStatsSection />
      <CTASection />
    </>
  );
};

export default Home;
