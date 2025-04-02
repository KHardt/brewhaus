import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./styles.css"; // Import styles

const fetchBreweryDetails = async (id) => {
  const res = await fetch(`https://api.openbrewerydb.org/v1/breweries/${id}`);
  return res.json();
};

export default function BreweryDetails() {
  const { id } = useParams();
  const { data: brewery, isLoading, error } = useQuery({
    queryKey: ["brewery", id],
    queryFn: () => fetchBreweryDetails(id),
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading brewery details</p>;

  return (
    <div className="container">
      <h1>{brewery.name}</h1>
      <p><strong>Type:</strong> {brewery.brewery_type}</p>
      <p><strong>Location:</strong> {brewery.city}, {brewery.state}</p>
      {brewery.website_url && (
        <p>
          <strong>Website:</strong>{" "}
          <a href={brewery.website_url} target="_blank" rel="noopener noreferrer">
            {brewery.website_url}
          </a>
        </p>
      )}
      <Link to="/" className="back-button">⬅ Back to list</Link>
    </div>
  );
}
