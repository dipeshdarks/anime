import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { AnimeResponse } from '@/lib/types';
import AnimeCard from '@/components/anime/AnimeCard';
import SearchBar from '@/components/ui/SearchBar';
import { Skeleton } from '@/components/ui/skeleton';

const SearchResults = () => {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1]);
    const q = params.get('q');
    if (q) {
      setSearchQuery(q);
    }
  }, [location]);
  
  const { data: searchResults, isLoading } = useQuery<AnimeResponse>({
    queryKey: [`/api/anime/search?q=${encodeURIComponent(searchQuery)}`],
    enabled: searchQuery.length > 0,
  });
  
  const animeList = searchResults?.data || [];
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-nunito font-bold mb-4">Search Results</h1>
        <SearchBar />
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {Array(10).fill(0).map((_, index) => (
            <div key={index} className="flex flex-col">
              <Skeleton className="h-56 w-full bg-[#2A2A2A]" />
              <div className="mt-2">
                <Skeleton className="h-5 w-3/4 bg-[#2A2A2A]" />
                <div className="flex justify-between mt-2">
                  <Skeleton className="h-4 w-1/4 bg-[#2A2A2A]" />
                  <Skeleton className="h-4 w-1/4 bg-[#2A2A2A]" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : animeList.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {animeList.map((anime) => (
            <AnimeCard key={anime.mal_id} anime={anime} />
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <h2 className="text-xl font-nunito mb-2">No results found for "{searchQuery}"</h2>
          <p className="text-gray-400">Try different keywords or check your spelling</p>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
