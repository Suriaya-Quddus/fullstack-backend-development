from fastapi import FastAPI, HTTPException, status
from fastapi.responses import HTMLResponse
from typing import Optional
from datetime import datetime

# Create FastAPI app (like const app = express())
app = FastAPI()

# In-memory "database" – same structure as your Express version
movies = [
    {"id": 1, "title": "Inception", "director": "Christopher Nolan", "year": 2010},
    {"id": 2, "title": "The Matrix", "director": "The Wachowskis", "year": 1999},
    {"id": 3, "title": "Parasite", "director": "Bong Joon-ho", "year": 2019},
]

# Helper: generate next id (similar to your Express logic)
def generate_next_id():
    if len(movies) == 0:
        return 1
    # take max id and add 1
    return max(movie["id"] for movie in movies) + 1


# Simple validation function (similar idea to validate_student_data)
def validate_movie_data(movie: dict) -> Optional[str]:
    """
    Returns an error message string if invalid, otherwise None.
    """

    # title required and must be a non-empty string
    if not movie.get("title") or not isinstance(movie["title"], str):
        return "Title is required and must be a string"

    # director required and must be a non-empty string
    if not movie.get("director") or not isinstance(movie["director"], str):
        return "Director is required and must be a string"

    # year is required, must be an integer in a realistic range
    year = movie.get("year")
    if not isinstance(year, int):
        return "Year must be an integer"

    current_year = datetime.now().year
    if year < 1888 or year > current_year + 1:
        return f"Year must be between 1888 and {current_year + 1}"

    # no error
    return None


# Root route: simple HTML page listing movies (like in student demo)
@app.get("/", response_class=HTMLResponse)
def read_root():
    html = "<b>Movie management app with FastAPI</b><ol>"
    for movie in movies:
        html += (
            f"<li>Title: {movie['title']}, Year: {movie['year']}, "
            f"Director: {movie['director']} [id:{movie['id']}]</li>"
        )
    html += "</ol>"
    html += """
    <p>Try these endpoints:</p>
    <pre>
GET /movies
GET /movies/{id}
POST /movies       (JSON body)
PATCH /movies/{id} (JSON body)
DELETE /movies/{id}
    </pre>
    """
    return html


# GET /movies - get all movies, with optional filters
@app.get("/movies")
def get_movies(
    title: Optional[str] = None,
    director: Optional[str] = None,
    year: Optional[int] = None,
):
    result = movies.copy()

    # Filter by title (contains, case-insensitive)
    if title:
        title_lower = title.lower()
        result = [m for m in result if title_lower in m["title"].lower()]

    # Filter by director (contains, case-insensitive)
    if director:
        director_lower = director.lower()
        result = [m for m in result if director_lower in m["director"].lower()]

    # Filter by year (exact match)
    if year is not None:
        result = [m for m in result if m["year"] == year]

    return result


# GET /movies/{id} - get one movie by id
@app.get("/movies/{id}")
def get_movie(id: int):
    for movie in movies:
        if movie["id"] == id:
            return movie
    # Movie not found
    raise HTTPException(status_code=404, detail="Movie not found")


# POST /movies - create a new movie
@app.post("/movies", status_code=status.HTTP_201_CREATED)
def add_movie(movie: dict):
    # Create a candidate new movie
    try:
        year_int = int(movie.get("year"))
    except (TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Year must be a number")

    new_movie = {
        "id": generate_next_id(),
        "title": movie.get("title"),
        "director": movie.get("director"),
        "year": year_int,
    }

    # Validate data
    error = validate_movie_data(new_movie)
    if error:
        raise HTTPException(status_code=400, detail=error)

    movies.append(new_movie)
    return new_movie


# PATCH /movies/{id} - update an existing movie (partial update)
@app.patch("/movies/{id}")
def update_movie(id: int, new_movie_data: dict):
    for i, movie in enumerate(movies):
        if movie["id"] == id:
            # Merge old + new (like JS spread: { ...movie, ...new_movie_data })
            updated_movie = {**movie, **new_movie_data}

            # Try to cast year if provided as string
            if "year" in new_movie_data:
                try:
                    updated_movie["year"] = int(updated_movie["year"])
                except (TypeError, ValueError):
                    raise HTTPException(status_code=400, detail="Year must be a number")

            # Validate merged movie
            error = validate_movie_data(updated_movie)
            if error:
                raise HTTPException(status_code=400, detail=error)

            movies[i] = updated_movie
            return updated_movie

    # If we exit the loop, movie not found
    raise HTTPException(status_code=404, detail="Movie not found")


# DELETE /movies/{id} - delete a movie
@app.delete("/movies/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_movie(id: int):
    for i, movie in enumerate(movies):
        if movie["id"] == id:
            movies.pop(i)
            return
    raise HTTPException(status_code=404, detail="Movie not found")
