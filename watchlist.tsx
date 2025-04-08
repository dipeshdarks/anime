import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { WatchlistItem } from '@/lib/types';
import { apiRequest } from '@/lib/queryClient';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Star,
  Trash,
  Play,
  BookmarkCheck 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const Watchlist = () => {
  const { toast } = useToast();
  
  const { data: watchlistItems, isLoading } = useQuery<WatchlistItem[]>({
    queryKey: ['/api/watchlist'],
  });
  
  const removeFromWatchlist = async (animeId: number, title: string) => {
    try {
      await apiRequest('DELETE', `/api/watchlist/${animeId}`);
      
      toast({
        title: "Removed from watchlist",
        description: `${title} has been removed from your watchlist`,
      });
      
      // Invalidate watchlist queries
      queryClient.invalidateQueries({ queryKey: ['/api/watchlist'] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from watchlist",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-nunito font-bold mb-2">My Watchlist</h1>
        <p className="text-gray-400">Manage your anime watchlist</p>
      </div>
      
      {isLoading ? (
        <div className="grid gap-4">
          {Array(3).fill(0).map((_, index) => (
            <Skeleton key={index} className="h-36 w-full bg-[#2A2A2A]" />
          ))}
        </div>
      ) : watchlistItems && watchlistItems.length > 0 ? (
        <div className="grid gap-4">
          {watchlistItems.map((item) => (
            <div key={item.id} className="bg-[#2A2A2A] rounded-lg overflow-hidden flex h-36">
              <div className="w-1/4 md:w-1/6 relative">
                <img 
                  src={item.imageUrl} 
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-[#FF4081] text-white text-xs px-2 py-1 rounded">
                  <span>{item.type || 'TV'}</span>
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between">
                    <h3 className="font-nunito font-semibold line-clamp-1">{item.title}</h3>
                    <button 
                      className="text-gray-400 hover:text-[#FF4081]"
                      onClick={() => removeFromWatchlist(item.animeId, item.title)}
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="text-yellow-400 h-4 w-4 mr-1" />
                    <span className="text-sm text-gray-300 mr-2">{item.rating || 'N/A'}</span>
                    <span className="text-xs text-gray-400">{item.year || 'N/A'}</span>
                  </div>
                </div>
                
                <div className="flex mt-4 space-x-2">
                  <Link href={`/anime/${item.animeId}`}>
                    <Button className="bg-[#FF4081] text-white hover:bg-[#ff679a] rounded-full flex items-center px-4 py-1">
                      <Play className="h-3 w-3 mr-1" /> Watch Now
                    </Button>
                  </Link>
                  <Button 
                    variant="outline"
                    className="border border-white text-white hover:bg-white/10 rounded-full flex items-center px-4 py-1"
                    onClick={() => removeFromWatchlist(item.animeId, item.title)}
                  >
                    <BookmarkCheck className="h-3 w-3 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#2A2A2A] rounded-lg">
          <BookmarkCheck className="mx-auto h-16 w-16 text-gray-500 mb-4" />
          <h2 className="text-xl font-nunito mb-2">Your watchlist is empty</h2>
          <p className="text-gray-400 mb-6">Browse anime and add titles to your watchlist</p>
          <Link href="/">
            <Button className="bg-[#FF4081] hover:bg-[#ff679a] text-white">
              Browse Anime
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Watchlist;
