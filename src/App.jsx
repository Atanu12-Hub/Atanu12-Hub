import { useEffect, useState } from "react";
import {
  Search,
  MapPin,
  Settings,
  Droplets,
  Wind,
  Sun,
  Sunrise,
  Sunset,
  Umbrella,
  Gauge,
} from "lucide-react";

import {
  getCityCoordinates,
  getWeather,
} from "./services/weatherApi";

function App() {
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [recentSearches, setRecentSearches] = useState([]);

  // Load weather for a city
  async function loadWeather(cityName) {
    try {
      setLoading(true);
      setError("");

      const place = await getCityCoordinates(cityName);

      const data = await getWeather(
        place.latitude,
        place.longitude
      );

      setLocation(place);
      setWeather(data);
    } catch {
      setError("City not found. Please try another city.");
    } finally {
      setLoading(false);
    }
  }

  // Initial weather
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWeather("Kolkata");
  }, []);

  // Search city
  function handleSearch(e) {
    e.preventDefault();

    if (!search.trim()) return;

    const city = search.trim();

    loadWeather(city);

    setRecentSearches((prev) => {
      const updated = [
        city,
        ...prev.filter(
          (item) =>
            item.toLowerCase() !== city.toLowerCase()
        ),
      ];

      return updated.slice(0, 5);
    });

    setSearch("");
  }

  // Search recent city
  function handleRecentSearch(city) {
    loadWeather(city);
  }

  // Use current location
  function handleMyLocation() {
    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by your browser."
      );
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } =
            position.coords;

          const data = await getWeather(
            latitude,
            longitude
          );

          setWeather(data);

          setLocation({
            name: "My Location",
            country: "",
            latitude,
            longitude,
          });
        } catch {
          setError(
            "Unable to fetch weather for your location."
          );
        } finally {
          setLoading(false);
        }
      },
      () => {
        setLoading(false);

        setError(
          "Location permission denied. Please allow location access."
        );
      }
    );
  }

  // Weather icon
  function getWeatherIcon(code) {
    if (code === 0) return "☀️";
    if (code <= 3) return "⛅";
    if (code <= 48) return "🌫️";
    if (code <= 67) return "🌧️";
    if (code <= 77) return "❄️";
    if (code <= 82) return "🌦️";

    return "⛈️";
  }

  // Weather condition
  function getWeatherText(code) {
    if (code === 0) return "Clear Sky";

    if (code === 1 || code === 2) {
      return "Partly Cloudy";
    }

    if (code === 3) return "Cloudy";

    if (code <= 48) return "Foggy";

    if (code <= 67) return "Rain";

    if (code <= 77) return "Snow";

    if (code <= 82) return "Rain Showers";

    return "Thunderstorm";
  }

  // Day name
  function getDayName(dateString, index) {
    if (index === 0) return "Today";

    return new Date(dateString).toLocaleDateString(
      "en-US",
      {
        weekday: "short",
      }
    );
  }

  // Initial loading screen
  if (loading && !weather) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center">
          <div className="mb-4 text-5xl animate-pulse">
            🌦️
          </div>

          <p className="text-slate-400">
            Loading weather...
          </p>
        </div>
      </div>
    );
  }

  const current = weather?.current;
  const hourly = weather?.hourly;
  const daily = weather?.daily;

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Background Glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto min-h-screen max-w-5xl px-4 py-6 sm:px-6">

        {/* HEADER */}
        <header className="mb-6 flex items-center justify-between">

          <div>
            <p className="text-xs text-slate-400">
              WEATHER
            </p>

            <h1 className="text-2xl font-bold tracking-tight">
              SkyCast 🌤️
            </h1>
          </div>

          <button
            className="rounded-full border border-slate-700 bg-slate-900 p-3 transition duration-300 hover:bg-slate-800 hover:border-blue-500/40"
          >
            <Settings size={19} />
          </button>

        </header>

        {/* SEARCH BAR */}
        <form
          onSubmit={handleSearch}
          className="mb-4 flex gap-2"
        >

          <div className="flex flex-1 items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 transition duration-300 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/10">

            <Search
              size={20}
              className="text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search city..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />

          </div>

          {/* Search */}
          <button
            type="submit"
            className="rounded-2xl bg-blue-500 px-4 transition duration-300 hover:-translate-y-0.5 hover:bg-blue-400 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0"
          >
            <Search size={21} />
          </button>

          {/* GPS */}
          <button
            type="button"
            onClick={handleMyLocation}
            className="rounded-2xl border border-slate-700 bg-slate-900 px-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-500/40 hover:bg-slate-800 hover:text-blue-400 active:translate-y-0"
            title="Use my location"
          >
            <MapPin size={21} />
          </button>

        </form>

        {/* RECENT SEARCHES */}
        {recentSearches.length > 0 && (
          <div className="mb-6">

            <p className="mb-2 text-xs font-medium text-slate-500">
              Recent Searches
            </p>

            <div className="flex flex-wrap gap-2">

              {recentSearches.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() =>
                    handleRecentSearch(city)
                  }
                  className="rounded-full border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition duration-300 hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-300"
                >
                  {city}
                </button>
              ))}

            </div>

          </div>
        )}

        {/* ERROR */}
        {error && (
          <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* UPDATING */}
        {loading && weather && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-300">

            <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-transparent" />

            Updating weather...

          </div>
        )}

        {/* CURRENT WEATHER */}
        {current && location && (
          <>

            {/* CURRENT WEATHER CARD */}
            <section className="overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 shadow-2xl transition duration-300 hover:border-slate-700 sm:p-8">

              <div className="flex flex-col items-center justify-between gap-8 sm:flex-row">

                {/* Main Weather */}
                <div>

                  <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">

                    <MapPin size={16} />

                    {location.name}

                    {location.country &&
                      `, ${location.country}`}

                  </div>

                  <p className="text-sm text-slate-400">
                    {new Date().toLocaleDateString(
                      "en-US",
                      {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      }
                    )}
                  </p>

                  <div className="mt-5 flex items-center gap-5">

                    <div className="text-7xl animate-pulse">
                      {getWeatherIcon(
                        current.weather_code
                      )}
                    </div>

                    <div>

                      <h2 className="text-7xl font-bold tracking-tight">

                        {Math.round(
                          current.temperature_2m
                        )}
                        °

                      </h2>

                      <p className="mt-1 text-lg text-slate-300">

                        {getWeatherText(
                          current.weather_code
                        )}

                      </p>

                    </div>

                  </div>

                  <p className="mt-4 text-sm text-slate-400">

                    Feels like{" "}

                    <span className="text-white">

                      {Math.round(
                        current.apparent_temperature
                      )}
                      °C

                    </span>

                  </p>

                </div>

                {/* Sunrise / Sunset */}
                <div className="w-full rounded-2xl border border-slate-800 bg-black/20 p-5 transition duration-300 hover:border-slate-700 sm:w-64">

                  {/* Sunrise */}
                  <div className="mb-4 flex items-center gap-3">

                    <Sunrise size={21} />

                    <div>

                      <p className="text-xs text-slate-400">
                        Sunrise
                      </p>

                      <p className="font-semibold">

                        {daily?.sunrise?.[0]
                          ? new Date(
                              daily.sunrise[0]
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )
                          : "--"}

                      </p>

                    </div>

                  </div>

                  <div className="h-px bg-slate-800" />

                  {/* Sunset */}
                  <div className="mt-4 flex items-center gap-3">

                    <Sunset size={21} />

                    <div>

                      <p className="text-xs text-slate-400">
                        Sunset
                      </p>

                      <p className="font-semibold">

                        {daily?.sunset?.[0]
                          ? new Date(
                              daily.sunset[0]
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )
                          : "--"}

                      </p>

                    </div>

                  </div>

                </div>

              </div>

            </section>

            {/* WEATHER STATS */}
            <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">

              <WeatherCard
                icon={<Droplets size={20} />}
                title="Humidity"
                value={`${current.relative_humidity_2m}%`}
              />

              <WeatherCard
                icon={<Wind size={20} />}
                title="Wind"
                value={`${Math.round(
                  current.wind_speed_10m
                )} km/h`}
              />

              <WeatherCard
                icon={<Sun size={20} />}
                title="UV Index"
                value={
                  daily?.uv_index_max?.[0] !==
                  undefined
                    ? Math.round(
                        daily.uv_index_max[0]
                      )
                    : "--"
                }
              />

              <WeatherCard
                icon={<Gauge size={20} />}
                title="Pressure"
                value={`${Math.round(
                  current.surface_pressure
                )} hPa`}
              />

            </section>

            {/* HOURLY FORECAST */}
            <section className="mt-7">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="text-lg font-semibold">
                  Hourly Forecast
                </h3>

                <span className="text-sm text-slate-500">
                  Next hours
                </span>

              </div>

              <div className="flex gap-3 overflow-x-auto pb-2">

                {hourly?.time
                  ?.slice(0, 12)
                  .map((time, index) => (

                    <Hourly
                      key={time}
                      time={
                        index === 0
                          ? "Now"
                          : new Date(
                              time
                            ).toLocaleTimeString(
                              [],
                              {
                                hour: "numeric",
                              }
                            )
                      }
                      icon={getWeatherIcon(
                        hourly.weather_code[index]
                      )}
                      temp={`${Math.round(
                        hourly.temperature_2m[index]
                      )}°`}
                      active={index === 0}
                    />

                  ))}

              </div>

            </section>

            {/* 7 DAY FORECAST */}
            <section className="mt-7">

              <div className="mb-4 flex items-center justify-between">

                <h3 className="text-lg font-semibold">
                  7-Day Forecast
                </h3>

                <span className="text-sm text-slate-500">
                  This week
                </span>

              </div>

              <div className="space-y-3">

                {daily?.time?.map(
                  (date, index) => (

                    <Day
                      key={date}
                      day={getDayName(
                        date,
                        index
                      )}
                      icon={getWeatherIcon(
                        daily.weather_code[index]
                      )}
                      condition={getWeatherText(
                        daily.weather_code[index]
                      )}
                      high={`${Math.round(
                        daily.temperature_2m_max[
                          index
                        ]
                      )}°`}
                      low={`${Math.round(
                        daily.temperature_2m_min[
                          index
                        ]
                      )}°`}
                    />

                  )
                )}

              </div>

            </section>

            {/* INFO CARDS */}
            <section className="mt-7 grid gap-3 sm:grid-cols-2">

              <InfoCard
                icon={<Umbrella size={20} />}
                title="Rain Probability"
                value={`${daily?.precipitation_probability_max?.[0] ?? 0}%`}
                description="Chance of rain today"
              />

              <InfoCard
                icon={<Gauge size={20} />}
                title="Pressure"
                value={`${Math.round(
                  current.surface_pressure
                )} hPa`}
                description="Current atmospheric pressure"
              />

            </section>

          </>
        )}

        {/* FOOTER */}
        <footer className="py-8 text-center text-xs text-slate-600">
          SkyCast • Live Weather Dashboard
        </footer>

      </div>
    </div>
  );
}

/* WEATHER CARD */
function WeatherCard({
  icon,
  title,
  value,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4 transition duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5">

      <div className="mb-3 text-blue-400">
        {icon}
      </div>

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="mt-1 text-lg font-semibold">
        {value}
      </p>

    </div>
  );
}

/* HOURLY CARD */
function Hourly({
  time,
  icon,
  temp,
  active,
}) {
  return (
    <div
      className={`min-w-[78px] rounded-2xl border p-4 text-center transition duration-300 hover:-translate-y-1 ${
        active
          ? "border-blue-500/50 bg-blue-500/10"
          : "border-slate-800 bg-slate-900 hover:border-blue-500/30"
      }`}
    >

      <p className="text-xs text-slate-400">
        {time}
      </p>

      <div className="my-4 text-2xl transition-transform duration-300 hover:scale-125">
        {icon}
      </div>

      <p className="font-semibold">
        {temp}
      </p>

    </div>
  );
}

/* DAILY CARD */
function Day({
  day,
  icon,
  condition,
  high,
  low,
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900 px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-blue-500/30 hover:bg-slate-800/80 hover:shadow-lg hover:shadow-blue-500/5">

      <p className="w-16 text-sm font-medium">
        {day}
      </p>

      <div className="text-2xl">
        {icon}
      </div>

      <p className="hidden flex-1 text-sm text-slate-400 sm:block">
        {condition}
      </p>

      <div className="flex gap-3 text-sm">

        <span className="font-semibold">
          {high}
        </span>

        <span className="text-slate-500">
          {low}
        </span>

      </div>

    </div>
  );
}

/* INFO CARD */
function InfoCard({
  icon,
  title,
  value,
  description,
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5 transition duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/5">

      <div className="mb-3 flex items-center gap-3">

        <div className="rounded-xl bg-slate-800 p-2 text-blue-400">
          {icon}
        </div>

        <p className="text-sm text-slate-400">
          {title}
        </p>

      </div>

      <p className="text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>

    </div>
  );
}

export default App;