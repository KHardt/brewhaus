import { useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import "./styles.css"; // Import styles

const fetchBreweries = async ({ pageParam = 1 }) => {
  const res = await fetch(
    `https://api.openbrewerydb.org/v1/breweries?page=${pageParam}&per_page=50`
  );
  return res.json();
};

export default function BreweryList() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["breweries"],
      queryFn: fetchBreweries,
      getNextPageParam: (_, pages) => pages.length + 1, // Increment page
    });

  const observer = useRef();
  const lastItemRef = (node) => {
    if (isFetchingNextPage) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage();
      }
    });
    if (node) observer.current.observe(node);
  };

  return (
    <div className="container">
      <h1>Brewery List</h1>
      <div className="brewery-list">
        {data?.pages.map((group, i) =>
          group.map((brewery, index) => (
            <Link
              key={brewery.id}
              to={`/brewery/${brewery.id}`}
              className="brewery-item"
              ref={
                i === data.pages.length - 1 && index === group.length - 1
                  ? lastItemRef
                  : null
              }
            >
              <h3>{brewery.name}</h3>
              <p>{brewery.city}, {brewery.state}</p>
            </Link>
          ))
        )}
      </div>
      {isFetchingNextPage && <p>Loading more...</p>}
    </div>
  );
}
