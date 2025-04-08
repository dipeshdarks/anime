import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimeResponse, Genre, GenreResponse } from '@/lib/types';
import HeroSection from '@/components/anime/HeroSection';
import AnimeSection from '@/components/anime/AnimeSection';
import GenreCard from '@/components/anime/GenreCard';
import RecommendedAnimeCard from '@/components/anime/RecommendedAnimeCard';
import SearchBar from '@/components/ui/SearchBar';
import { ChevronRight } from 'lucide-react';

// Genre images for demo (in production would come from a proper API)
const genreImages = [
  'https://images.unsplash.com/photo-1612546904902-a04e5f3c9c8d?auto=format&fit=crop&w=300&h=160&q=80',
  'https://images.unsplash.com/photo-1605979257913-1704eb7b6246?auto=format&fit=crop&w=300&h=160&q=80',
  'https://images.unsplash.com/photo-1659200825504-88ada0b59307?auto=format&fit=crop&w=300&h=160&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=300&h=160&q=80'
];

const Home = () => {
  // Mobile search bar
  const { data: trendingData, isLoading: trendingLoading } = useQuery<AnimeResponse>({
    queryKey: ['/api/anime/trending'],
  });

  const { data: topRatedData, isLoading: topRatedLoading } = useQuery<AnimeResponse>({
    queryKey: ['/api/anime/top-rated'],
  });
  
  const { data: genresData, isLoading: genresLoading } = useQuery<GenreResponse>({
    queryKey: ['/api/anime/genres'],
  });

  const featuredAnime = trendingData?.data ? trendingData.data[0] : null;
  const trendingAnime = trendingData?.data?.slice(0, 10) || [];
  const topRatedAnime = topRatedData?.data?.slice(0, 10) || [];
  const popularGenres = genresData?.data?.slice(0, 4) || [];
  const recommendedAnime = [...(topRatedData?.data?.slice(0, 3) || [])];

  return (
    <>
      {/* Mobile Search Bar - visible only on mobile */}
      <div className="md:hidden mb-6 relative">
        <SearchBar />
      </div>

      {/* Hero Section */}
      {featuredAnime && !trendingLoading && (
        <HeroSection anime={featuredAnime} />
      )}

      {/* Trending Section */}
      <AnimeSection 
        title="Trending Now" 
        animeList={trendingAnime} 
        viewAllLink="#trending"
        isLoading={trendingLoading}
      />

      {/* Top Rated Section */}
      <AnimeSection 
        title="Top Rated" 
        animeList={topRatedAnime} 
        viewAllLink="#top-rated"
        isLoading={topRatedLoading}
      />

      {/* Popular Genres Section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-nunito font-bold">Popular Genres</h2>
          <a href="#genres" className="text-[#FF4081] hover:underline text-sm flex items-center">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {genresLoading ? (
            Array(4).fill(0).map((_, index) => (
              <div key={index} className="h-24 rounded-lg bg-[#2A2A2A] animate-pulse"></div>
            ))
          ) : (
            popularGenres.map((genre, index) => (
              <GenreCard 
                key={genre.mal_id} 
                genre={genre}
                imageUrl={genreImages[index % genreImages.length]}
              />
            ))
          )}
        </div>
      </section>

      {/* Recommended Section */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-2xl font-nunito font-bold">Recommended For You</h2>
          <a href="#recommended" className="text-[#FF4081] hover:underline text-sm flex items-center">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topRatedLoading ? (
            Array(3).fill(0).map((_, index) => (
              <div key={index} className="h-36 rounded-lg bg-[#2A2A2A] animate-pulse"></div>
            ))
          ) : (
            recommendedAnime.map((anime) => (
              <RecommendedAnimeCard key={anime.mal_id} anime={anime} />
            ))
          )}
        </div>
      </section>
    </>
  );
};

export default Home;
