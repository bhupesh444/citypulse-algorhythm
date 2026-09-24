import React, { useState, useEffect, useRef, useCallback } from "react";
import { geocodingProvider, LocationSuggestion } from "../../services/GeocodingProvider";

interface LocationSearchProps {
  onSelectLocation: (location: LocationSuggestion) => void;
  className?: string;
  placeholder?: string;
}

export const LocationSearch: React.FC<LocationSearchProps> = ({
  onSelectLocation,
  className = "",
  placeholder = "Search places, roads, areas...",
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<any>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Debounced search (250-350ms)
  const performSearch = useCallback(async (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const results = await geocodingProvider.searchLocations(trimmed);
      setSuggestions(results);
      setIsOpen(true);
      setActiveIndex(-1);
      if (results.length === 0) {
        // Handled in render with empty state
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setErrorMessage("Unable to search locations. Check your connection and try again.");
        setSuggestions([]);
        setIsOpen(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (val.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    setIsLoading(true);
    debounceTimerRef.current = setTimeout(() => {
      performSearch(val);
    }, 280);
  };

  const handleSelect = (item: LocationSuggestion) => {
    setQuery(item.name);
    setIsOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
    onSelectLocation(item);
  };

  // Clear search input
  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setErrorMessage(null);
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      if (suggestions.length > 0 || query.trim().length >= 2) {
        setIsOpen(true);
        if (query.trim().length >= 2 && suggestions.length === 0) {
          performSearch(query);
        }
      }
      return;
    }

    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev < suggestions.length - 1 ? prev + 1 : 0;
        scrollSuggestionIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = prev > 0 ? prev - 1 : suggestions.length - 1;
        scrollSuggestionIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        handleSelect(suggestions[0]);
      }
    }
  };

  const scrollSuggestionIntoView = (index: number) => {
    if (!listboxRef.current) return;
    const items = listboxRef.current.querySelectorAll("li.suggestion-item");
    if (items[index]) {
      items[index].scrollIntoView({ block: "nearest" });
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  // "Use my location" button
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("Geolocation is not supported by your browser.");
      return;
    }

    setGeoStatus("Acquiring GPS fix...");
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLoading(false);
        setGeoStatus(null);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const myLoc: LocationSuggestion = {
          id: `gps-${lat.toFixed(4)}-${lng.toFixed(4)}`,
          name: "My Current Location",
          secondaryText: `${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E · GPS Fix`,
          latitude: lat,
          longitude: lng,
          placeType: "user",
          source: "local",
        };
        handleSelect(myLoc);
      },
      (err) => {
        setIsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGeoStatus("Location access was not allowed.");
        } else {
          setGeoStatus("Unable to determine GPS position.");
        }
      },
      { timeout: 9000, enableHighAccuracy: true, maximumAge: 30000 }
    );
  };

  return (
    <div
      ref={containerRef}
      className={`location-search-wrapper ${className}`}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls="location-suggestions-dropdown"
    >
      <div className="location-search-input-box">
        <span className="search-lead-icon" aria-hidden="true">
          ⌕
        </span>

        <input
          ref={inputRef}
          type="text"
          className="location-search-input"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length >= 2) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          aria-label="Search places, roads, areas"
          aria-autocomplete="list"
          aria-controls="location-suggestions-dropdown"
          aria-activedescendant={
            activeIndex >= 0 ? `suggestion-opt-${activeIndex}` : undefined
          }
          autoComplete="off"
          spellCheck="false"
          style={{ outline: "none", boxShadow: "none" }}
        />

        {isLoading && (
          <span className="search-spinner" aria-label="Loading suggestions">
            <span className="spinner-dot" />
          </span>
        )}

        {query && !isLoading && (
          <button
            type="button"
            className="search-clear-btn"
            onClick={handleClear}
            aria-label="Clear search input"
            title="Clear"
          >
            ✕
          </button>
        )}
      </div>

      {/* Suggestion Dropdown Panel */}
      {isOpen && (
        <div
          id="location-suggestions-dropdown"
          className="location-suggestions-panel"
        >
          {/* Quick "Use my location" Action */}
          <div className="search-quick-actions">
            <button
              type="button"
              className="use-location-btn"
              onClick={handleUseMyLocation}
              title="Use current GPS location"
            >
              <span className="use-location-icon">⌖</span>
              <span className="use-location-text">Use my location</span>
            </button>
            {geoStatus && (
              <span className="geo-status-msg" role="status">
                {geoStatus}
              </span>
            )}
          </div>

          {/* Error State */}
          {errorMessage && (
            <div className="search-dropdown-error" role="alert">
              <span className="error-title">Unable to search locations</span>
              <span className="error-desc">Check your connection and try again.</span>
              <button
                type="button"
                className="search-retry-btn"
                onClick={() => performSearch(query)}
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty Results State */}
          {!errorMessage && !isLoading && suggestions.length === 0 && query.trim().length >= 2 && (
            <div className="search-dropdown-empty">
              <span className="empty-icon">📍</span>
              <span className="empty-title">No locations found</span>
              <span className="empty-subtitle">
                Try searching for a landmark, road, or area in Jaipur
              </span>
            </div>
          )}

          {/* Suggestions List */}
          {!errorMessage && suggestions.length > 0 && (
            <ul
              ref={listboxRef}
              className="suggestions-list"
              role="listbox"
              aria-label="Location suggestions"
            >
              {suggestions.map((item, idx) => {
                const isActive = idx === activeIndex;
                return (
                  <li
                    key={item.id || `${item.latitude}-${item.longitude}-${idx}`}
                    id={`suggestion-opt-${idx}`}
                    role="option"
                    aria-selected={isActive}
                    className={`suggestion-item ${isActive ? "is-active" : ""}`}
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setActiveIndex(idx)}
                  >
                    <span className="suggestion-pin" aria-hidden="true">
                      📍
                    </span>
                    <div className="suggestion-text-block">
                      <span className="suggestion-place-name">{item.name}</span>
                      <span className="suggestion-address">{item.secondaryText}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          {/* Desktop Keyboard Navigation Footer Hint */}
          <div className="suggestions-footer-hint" aria-hidden="true">
            <span className="hint-item">
              <kbd>↑</kbd> <kbd>↓</kbd> Navigate
            </span>
            <span className="hint-sep">·</span>
            <span className="hint-item">
              <kbd>Enter</kbd> Select
            </span>
            <span className="hint-sep">·</span>
            <span className="hint-item">
              <kbd>Esc</kbd> Close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
