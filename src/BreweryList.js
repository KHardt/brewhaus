import { useState, useRef, useEffect } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { debounce } from "lodash";
import "./styles.css";

const fetchBreweries = async ({ pageParam = 1 }) => {
    try {
      const res = await fetch(
        `https://api.openbrewerydb.org/v1/breweries?page=${pageParam}&per_page=50`
      );

      if (!res.ok) {
        return {
            error: `Failed to load breweries (${res.status})`,
            _hasError: true,
            data: []
        };
      }

      const data = res.json();
      
      return data;
    } catch (error) {
      console.error("Error fetching breweries:", error);
      return {
        error: error.message,
        _hasError: true,
        data: []
      };
    }
  };
  
  const searchBreweries = async ({ pageParam = 1, query }) => {
    try {
      if (!query) return [];

      const encodedQuery = encodeURIComponent(query.trim());
      
      const res = await fetch(
        `https://api.openbrewerydb.org/v1/breweries/search?query=${encodedQuery}&page=${pageParam}&per_page=50`
      );

      if (!res.ok) {
        return {
            error: `Failed to find results (${res.status})`,
            _hasError: true,
            data: []
        };
      }

      //TODO- test in POSTMAN
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('not JSON');
        return [];
      }

      const data = await res.json();
      return data;
    } catch (error) {
      console.error("Error searching breweries:", error);
      return {
        error: error.message,
        _hasError: true
      };
    }
  };

export default function BreweryList() {
    const [searchTerm, setSearchTerm] = useState("");
    const observerRef = useRef(null);

    // Infinite query for breweries
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useInfiniteQuery({
        queryKey: ["breweries"],
        queryFn: fetchBreweries,
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 50) {
                return undefined;
            }
            return allPages.length + 1;
        },
        enabled: !searchTerm,
    });

    // Infinite query for search results
    const {
        data: searchResults,
        fetchNextPage: fetchSearchNextPage,
        hasNextPage: hasSearchNextPage,
        isFetchingNextPage: isFetchingSearchNextPage,
    } = useInfiniteQuery({
        queryKey: ["searchBreweries", searchTerm],
        queryFn: ({ pageParam = 1 }) => searchBreweries({ pageParam, query: searchTerm }),
        getNextPageParam: (lastPage, allPages) => {
            if (lastPage.length < 50) {
                return undefined;
            }
            return allPages.length + 1;
        },
        enabled: !!searchTerm, // Only enable search query if there is a search term
    });

    const debouncedSearch = useRef(
        debounce((value) => setSearchTerm(value), 300)
    ).current;

    // useEffect(() => {
    //     return () => {
    //         debouncedSearch.cancel();
    //     };
    // },[debouncedSearch]);

    // Infinite Scroll: Fetch next page when the last item is visible
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    if (searchTerm && hasSearchNextPage && !isFetchingSearchNextPage) {
                        fetchSearchNextPage();
                    } else if (!searchTerm && hasNextPage && !isFetchingNextPage) {
                        fetchNextPage();
                    }
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => observer.disconnect();
    }, [fetchNextPage, fetchSearchNextPage, searchTerm, hasNextPage, hasSearchNextPage, isFetchingNextPage, isFetchingSearchNextPage]);

    // Helper to flatten brewery data for rendering
    const breweriesToDisplay = searchTerm
        ? searchResults?.pages.flatMap(page => page) || []
        : data?.pages.flatMap(page => page) || [];

    return (
        <div className="container">
            <h1>Brewery List</h1>

            {/* Search Bar */}
            <input
                type="text"
                placeholder="Search breweries..."
                className="search-bar"
                onChange={(e) => debouncedSearch(e.target.value)}
            />

            <div className="brewery-list">
                {breweriesToDisplay.map((brewery) => (
                    <Link key={brewery.id} to={`/brewery/${brewery.id}`} className="brewery-item">
                        <h3>{brewery.name}</h3>
                        <p>{brewery.city}, {brewery.state}</p>
                    </Link>
                ))}
            </div>

            {/* Infinite Scroll Trigger */}
            {((!searchTerm && hasNextPage) || (searchTerm && hasSearchNextPage)) && (
                <div ref={observerRef} className="loading">
                    {isFetchingNextPage || isFetchingSearchNextPage
                        ? "Loading more..."
                        : "Load more..."}
                </div>
            )}
        </div>
    );
}