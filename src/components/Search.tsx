import { useState, useEffect, useRef } from "react";
import { useParams, useLocation } from "react-router-dom";
import "../style/search.css";
import FilterIcon from "../assets/FilterIcon";
import HeaderNavbar from "./HeaderNav";
import LoadingIcon from "../assets/LoadingIcon";
import {
  fetchMoviesBySearch,
  fetchGenres,
  fetchMoviesByCategory,
  fetchMoviesByFilter,
} from "../api";
import MovieCard from "./MovieCard";
import { Item } from "../utils";
import { FilterListWithTag } from "./SearchListCheckbox";

const Search = () => {
  const [reload, setReload] = useState(false);
  //   const scrollPosRef = useRef(0); // Ref to store scroll position
  const prevIdRef = useRef(null);
  const filterMenu = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [scrollYValue, setScrollYValue] = useState(0);
  const [totalResults, setTotalResults] = useState(0);
  const [page, setPage] = useState(1);
  const [openFilterMenu, setOpenFilterMenu] = useState(false);
  const location = useLocation();
  const { id } = useParams();
  const isSearchPath = location.pathname.includes("search");
  const [filterValues, setFilterValues] = useState({
    availabilities: [],
    genres: [],
  });
  const [moviesData, setMoviesData] = useState<Item[]>([]);
  const [genresData, setGenresData] = useState([]);
  const scrollPositionRef = useRef<number | null>(null);
  const getMovieDetails = async () => {
    setLoading(true);
    let newArr: any = [];
    let movie: any;
    if (isSearchPath) {
      movie = await fetchMoviesBySearch(id, page);
    } else if (
      filterValues.availabilities.length ||
      filterValues.genres.length
    ) {
      movie = await fetchMoviesByFilter(filterValues, page);
    } else {
      movie = await fetchMoviesByCategory(id, page);
    }
    if (page === 1) {
      newArr = [...movie.results];
    } else {
      newArr = [...moviesData, ...movie.results];
    }
    setMoviesData(newArr);
    setTotalResults(movie.total_results);
    setLoading(false);
    setOpenFilterMenu(false);
  };

  const fetchGenresDetails = async () => {
    const genre = await fetchGenres();
    setGenresData(genre);
  };

  const handleScroll = () => {
    if (loading) return;
    setScrollYValue(window.scrollY);
    // Restore scroll position after data is loaded
    scrollPositionRef.current = window.scrollY;
    if (window.innerHeight + window.scrollY > document.body.offsetHeight) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  useEffect(() => {
    fetchGenresDetails();
  }, []);

  useEffect(() => {
    if (id !== prevIdRef.current) {
      // @ts-ignore
      prevIdRef.current = id;
      //   prevent extra api call
      if (page !== 1) {
        return setPage(1);
      }
    }
    getMovieDetails();
  }, [page, id, reload]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        filterMenu.current &&
        !filterMenu.current.contains(event.target as Node)
      ) {
        setOpenFilterMenu(false);
      }
    };
    // if click outside then open search closed
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);
  useEffect(() => {
    if (scrollPositionRef.current !== null) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [loading]);
  return (
    <>
      <HeaderNavbar scrollYValue={scrollYValue} setPage={setPage} />
      {loading ? (
        <LoadingIcon />
      ) : (
        <div
          className={`block lg:flex relative top-12 md:top-20 max-w-[1400px] m-auto px-4 md:px-16 pb-8 md:pb:0 ${
            openFilterMenu ? "h-[100vh]" : ""
          }`}
        >
          {!isSearchPath && (
            <>
              <div className="flex items-center lg:hidden md:w-10/12 mt-8">
                <div
                  className="h-[40px]  w-[100px] bg-gray-200 flex items-center justify-between rounded  px-4 z-0"
                  onClick={() => setOpenFilterMenu(!openFilterMenu)}
                >
                  <p className="text-black text-md">Filter </p>
                  <FilterIcon />
                </div>
                <p className="text-lg font-normal text-white ml-4">
                  {totalResults} Result Found
                </p>
              </div>

              <div
                className={
                  openFilterMenu
                    ? `w-[100%] pt-11 pb-4 z-50 px-2 md:w-[400px] h-[93vh] text-center overflow-hidden fixed bottom-0 left-0 rounded-t-lg bg-gray-100 animate-slideUp animated`
                    : "lg:w-1/4 lg:mt-0 lg:py-0 hidden lg:block"
                }
                ref={filterMenu}
              >
                <div className="h-[40px] bg-gray-200 justify-between px-4 items-center rounded flex w-full">
                  <button
                    onClick={() => {
                      if (page === 1) {
                        setReload(true);
                      } else {
                        setPage(1);
                      }
                    }}
                    type="button"
                    className="text-sm text-white bg-gradient-to-r from-blue-400 via-blue-600 to-blue-700 hover:bg-gradient-to-br shadow-lg shadow-blue-500/50 dark:shadow-lg dark:shadow-blue-800/80 font-medium rounded-lg px-8 py-1"
                  >
                    Search
                  </button>
                  <p
                    className="text-black text-sm cursor-pointer "
                    onClick={() => {
                      setOpenFilterMenu(false);
                      setFilterValues({
                        availabilities: [],
                        genres: [],
                      });
                    }}
                  >
                    Reset
                  </p>
                </div>
                <div className="h-[80vh] md:h-[75vh] lg:h-full overflow-auto">
                  <div className="p-4 bg-white rounded border mt-4w-full mt-4">
                    <FilterListWithTag
                      items={genresData}
                      title="Genres"
                      setFilterValues={setFilterValues}
                      filterValues={filterValues}
                      keyValue="genres"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div
            className={
              isSearchPath
                ? `w-full mx-auto`
                : `w-full md:w-10/12 lg:w-9/12 lg:pl-4 mx-auto`
            }
          >
            <div
              className={
                isSearchPath ? `mt-5 lg:mt-0` : `hidden lg:block mt-5 lg:mt-0`
              }
            >
              <p className="text-lg font-normal text-white mb-4">
                {totalResults} Result Found
              </p>
            </div>
            <div
              className={
                isSearchPath
                  ? `grid grid-cols-2  sm:grid-cols-3  md:grid-cols-4 lg:grid-cols-4 gap-4 mt-4`
                  : `grid grid-cols-2  sm:grid-cols-3  md:grid-cols-4 lg:grid-cols-3 gap-4 mt-8 lg:mt-4`
              }
            >
              {moviesData.map((movie: any, index: number) => (
                <MovieCard movie={movie} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
export default Search;
