import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  SingleAnimeResponse,
  EpisodeResponse,
  RecommendationResponse,
  Episode
} from '@/lib/types';
import {
  Play,
  Bookmark,
  BookmarkCheck,
  Star,
  Eye,
  PlayCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import AnimeCard from '@/components/anime/AnimeCard';
import { Skeleton } from '@/components/ui/skeleton';

const AnimeDetails = () => {
  const { id } = useParams();
  const animeId = parseInt(id || '0');
  const { toast } = useToast();

  // Fetch anime details
  const { data: animeData, isLoading: animeLoading } = useQuery<SingleAnimeResponse>({
    queryKey: [`/api/anime/${animeId}`],
  });

  // Fetch episodes
  const { data: episodesData, isLoading: episodesLoading } = useQuery<EpisodeResponse>({
    queryKey: [`/api/anime/${animeId}/episodes`],
  });

  // Fetch similar anime
  const { data: similarData, isLoading: similarLoading } = useQuery<RecommendationResponse>({
    queryKey: [`/api/anime/${animeId}/similar`],
  });

  // Check if anime is in watchlist
  const { data: watchlistStatus } = useQuery<{ inWatchlist: boolean }>({
    queryKey: [`/api/watchlist/check/${animeId}`],
  });

  const [isInWatchlist, setIsInWatchlist] = useState(watchlistStatus?.inWatchlist || false);

  useEffect(() => {
    if (watchlistStatus) {
      setIsInWatchlist(watchlistStatus.inWatchlist);
    }
  }, [watchlistStatus]);

  const anime = animeData?.data;
  const episodes = episodesData?.data || [];
  const similarAnime = similarData?.data || [];
  const displayedEpisodes = episodes.slice(0, 3);

  const toggleWatchlist = async () => {
    try {
      if (isInWatchlist) {
        // Remove from watchlist
        await apiRequest('DELETE', `/api/watchlist/${animeId}`);
        setIsInWatchlist(false);
        toast({
          title: "Removed from watchlist",
          description: `${anime?.title} has been removed from your watchlist`,
        });
      } else if (anime) {
        // Add to watchlist
        await apiRequest('POST', '/api/watchlist', {
          animeId: anime.mal_id,
          title: anime.title,
          imageUrl: anime.images.jpg.image_url,
          type: anime.type,
          rating: anime.score?.toString(),
          year: anime.year?.toString(),
        });
        setIsInWatchlist(true);
        toast({
          title: "Added to watchlist",
          description: `${anime.title} has been added to your watchlist`,
        });
      }
      
      // Invalidate watchlist queries
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
      queryClient.invalidateQueries({ queryKey: [`/api/watchlist/check/${animeId}`] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive",
      });
    }
  };

  if (animeLoading) {
    return (
      <div className="animate-pulse">
        <Skeleton className="h-80 w-full rounded-xl bg-[#2A2A2A] mb-6" />
        <Skeleton className="h-12 w-3/4 bg-[#2A2A2A] mb-4" />
        <Skeleton className="h-6 w-1/2 bg-[#2A2A2A] mb-6" />
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Skeleton className="h-8 bg-[#2A2A2A]" />
          <Skeleton className="h-8 bg-[#2A2A2A]" />
          <Skeleton className="h-8 bg-[#2A2A2A]" />
          <Skeleton className="h-8 bg-[#2A2A2A]" />
        </div>
        <Skeleton className="h-40 w-full bg-[#2A2A2A] mb-6" />
      </div>
    );
  }

  if (!anime) {
    return <div>Anime not found</div>;
  }

  return (
    <div className="bg-[#1A1A1A] pb-12">
      <div className="relative">
        <div className="h-64 sm:h-80 w-full">
          <img 
            src={anime.images.jpg.large_image_url} 
            alt={`${anime.title} banner`}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2A2A2A] via-[#2A2A2A]/75 to-transparent"></div>
        </div>
        
        <div className="absolute bottom-0 left-0 w-full p-6 flex gap-6">
          <div className="w-32 h-48 rounded-lg overflow-hidden shadow-lg border-4 border-[#2A2A2A] flex-shrink-0">
            <img 
              src={anime.images.jpg.large_image_url} 
              alt={anime.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-nunito font-bold mb-2">{anime.title}</h1>
            <div className="flex flex-wrap gap-2 mb-3">
              <Badge className="bg-[#FF4081] text-white">{anime.type}</Badge>
              <Badge className="bg-gray-700 text-white">{anime.episodes ? `${anime.episodes} Episodes` : "Unknown Episodes"}</Badge>
              <Badge className="bg-gray-700 text-white">{anime.year || "Unknown Year"}</Badge>
              <Badge className="bg-gray-700 text-white">{anime.status}</Badge>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {anime.genres.map(genre => (
            <Badge key={genre.mal_id} className="bg-gray-700 text-white">{genre.name}</Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <div className="flex items-center mr-4">
              <Star className="text-yellow-400 h-5 w-5 mr-1" />
              <span className="font-semibold">{anime.score || 'N/A'}</span>
              <span className="text-gray-400 text-sm ml-1">({anime.scored_by?.toLocaleString() || 0} votes)</span>
            </div>
            <div className="flex items-center">
              <Eye className="text-gray-400 h-5 w-5 mr-1" />
              <span className="text-gray-300">{anime.members?.toLocaleString() || 0} viewers</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button className="bg-[#FF4081] text-white hover:bg-[#ff679a] rounded-full py-2 px-4 flex items-center">
              <Play className="h-4 w-4 mr-1" /> Watch
            </Button>
            <Button 
              variant="outline"
              className="border border-white text-white rounded-full py-2 px-4 flex items-center hover:bg-white/10"
              onClick={toggleWatchlist}
            >
              {isInWatchlist ? (
                <>
                  <BookmarkCheck className="h-4 w-4 mr-1" /> Watchlist
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4 mr-1" /> Watchlist
                </>
              )}
            </Button>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-nunito font-semibold mb-3">Synopsis</h2>
          <p className="text-gray-300 mb-3">
            {anime.synopsis || 'No synopsis available.'}
          </p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xl font-nunito font-semibold mb-3">Episodes</h2>
          <div className="grid grid-cols-1 gap-3 mb-4 max-h-[300px] overflow-y-auto pr-2">
            {episodesLoading ? (
              Array(3).fill(0).map((_, index) => (
                <Skeleton key={index} className="h-16 w-full bg-[#2A2A2A]" />
              ))
            ) : displayedEpisodes.length > 0 ? (
              <>
                {displayedEpisodes.map((episode) => (
                  <div key={episode.mal_id} className="bg-[#141414] rounded-lg p-3 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-16 h-9 rounded overflow-hidden mr-3 flex-shrink-0 bg-gray-700">
                        <img 
                          src={anime.images.jpg.small_image_url}
                          alt={`Episode ${episode.episode || '?'} thumbnail`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="text-gray-400 text-sm mr-2">
                            EP{(() => {
                              // Handle all possible cases for episode numbers
                              if (!episode.episode) {
                                return "??";
                              }
                              // If it's a string, ensure it's padded
                              if (typeof episode.episode === 'string') {
                                return episode.episode.padStart(2, '0');
                              }
                              // Convert number to string and pad
                              return String(episode.episode).padStart(2, '0');
                            })()}
                          </span>
                          <h3 className="font-nunito font-semibold">{episode.title}</h3>
                        </div>
                        <div className="text-xs text-gray-400">24 min</div>
                      </div>
                    </div>
                    <button className="text-white hover:text-[#FF4081]">
                      <PlayCircle className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <button className="w-full py-2 text-center text-[#FF4081] hover:underline">
                  View All Episodes
                </button>
              </>
            ) : (
              <p className="text-gray-400">No episodes information available</p>
            )}
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-nunito font-semibold mb-3">Similar Anime</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {similarLoading ? (
              Array(4).fill(0).map((_, index) => (
                <div key={index} className="flex flex-col">
                  <Skeleton className="h-36 w-full bg-[#2A2A2A]" />
                  <div className="mt-2">
                    <Skeleton className="h-5 w-3/4 bg-[#2A2A2A]" />
                    <div className="flex justify-between mt-2">
                      <Skeleton className="h-4 w-1/4 bg-[#2A2A2A]" />
                    </div>
                  </div>
                </div>
              ))
            ) : similarAnime.length > 0 ? (
              similarAnime.slice(0, 4).map((recommendation) => (
                <div 
                  key={recommendation.entry.mal_id} 
                  className="anime-card bg-[#141414] rounded-lg overflow-hidden flex flex-col"
                >
                  <div className="relative h-36">
                    <img 
                      src={recommendation.entry.images.jpg.large_image_url} 
                      alt={recommendation.entry.title}
                      className="w-full h-full object-cover"
                    />
                    <button className="absolute bottom-2 right-2 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30">
                      <Bookmark className="text-white h-3 w-3" />
                    </button>
                  </div>
                  <div className="p-2">
                    <h3 className="font-nunito font-semibold text-sm line-clamp-1">{recommendation.entry.title}</h3>
                    <div className="flex items-center">
                      <Star className="text-yellow-400 h-3 w-3 mr-1" />
                      <span className="text-xs text-gray-300">N/A</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 col-span-4">No similar anime available</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnimeDetails;
