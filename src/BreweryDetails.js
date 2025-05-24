import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./styles.css"; // Import styles

const fetchBreweryDetails = async (id) => {
  try {
    const res = await fetch(`https://api.openbrewerydb.org/v1/breweries/${id}`);

    if (!res.ok) {
        return {
            error: `Failed to find results (${res.status})`,
            _hasError: true,
            data: []
        };
      }
    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Error fetching brewery details:", error);
    return {
      name: "Brewery information unavailable",
      error: error.message,
      _hasError: true
    };
  }
};

// Helper function to format phone number
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) return "";

  // Basic US phone formatting (adjust as needed)
  const cleaned = phoneNumber.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  }
  return phoneNumber;
};

export default function BreweryDetails() {
  const { id } = useParams();
  const { data: brewery, isLoading } = useQuery({
    queryKey: ["brewery", id],
    queryFn: () => fetchBreweryDetails(id),
  });

  if (isLoading) return <p>Loading brewery details...</p>;

  return (
    <div className="container">
      <h1>{brewery?.name || "Unnamed Brewery"}</h1>

      {brewery?.error && (
        <div className="error-message">
          <p>There was a problem loading complete brewery information: {brewery.error}</p>
          <p>Showing available information below.</p>
        </div>
      )}

      {brewery?.brewery_type && <p><strong>Type:</strong> {brewery.brewery_type}</p>}

      {/* Display address information if available */}
      {brewery?.street && (
        <p>
          <strong>Address:</strong> {brewery.street}
          {brewery?.city && `, ${brewery.city}`}
          {brewery?.state && `, ${brewery.state}`}
          {brewery?.postal_code && `, ${brewery.postal_code}`}
        </p>
      )}

      {brewery?.country && <p><strong>Country:</strong> {brewery.country}</p>}

      {/* Display formatted phone number if available */}
      {brewery?.phone && (
        <p>
          <strong>Phone:</strong>{" "}
          <a href={`tel:${brewery.phone}`}>
            {formatPhoneNumber(brewery.phone)}
          </a>
        </p>
      )}

      {/* Display website if available */}
      {brewery?.website_url && (
        <p>
          <strong>Website:</strong>{" "}
          <a
            href={brewery.website_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Visit ${brewery.name}'s website`}
          >
            {brewery.website_url}
          </a>
        </p>
      )}

      <Link
        to="/"
        className="back-button"
        aria-label="Return to brewery list"
      >
        ⬅ Back to list
      </Link>
    </div>
  );
}