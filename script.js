// ===========================
// Spoonacular API Key
// ===========================
const API_KEY = "495cfb43f4a148f5adb8e43b75900bf4"; // <-- Add your Spoonacular API key here

// ===========================
// Favorites Handling
// ===========================
function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem('rf_favs') || "{}");
  } catch (e) {
    return {};
  }
}

function saveFavorites(favs) {
  localStorage.setItem('rf_favs', JSON.stringify(favs));
}

// ===========================
// Recipe Search
// ===========================
async function findRecipes() {
  const ingredientsInput = document.getElementById("ingredients");
  const dietInput = document.getElementById("dietType");
  const resultsDiv = document.getElementById("recipeResults");

  if (!ingredientsInput || !resultsDiv) return;

  const ingredients = ingredientsInput.value.trim();
  const diet = dietInput.value || "";

  resultsDiv.innerHTML = "";

  if (!ingredients) {
    resultsDiv.innerHTML = "<p style='color:red;'>Please enter ingredients.</p>";
    return;
  }

  resultsDiv.innerHTML = "<p>Loading recipes...</p>";

  try {
    const url = `https://api.spoonacular.com/recipes/complexSearch?includeIngredients=${encodeURIComponent(ingredients)}&diet=${encodeURIComponent(diet)}&number=12&addRecipeInformation=true&apiKey=${API_KEY}`;

    const res = await fetch(url);
    const data = await res.json();

    resultsDiv.innerHTML = "";

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "<p>No recipes found. Try different ingredients or diet type.</p>";
      return;
    }

    const favs = loadFavorites();

    data.results.forEach(recipe => {
      const card = document.createElement("div");
      card.className = "recipe";

      card.innerHTML = `
        <h3>${recipe.title}</h3>
        <img src="${recipe.image}" alt="${recipe.title}">
        <p>Ready in: ${recipe.readyInMinutes} mins</p>
        <p>Servings: ${recipe.servings}</p>
        <a href="${recipe.sourceUrl}" target="_blank">View Full Recipe</a>
        <button class="fav-btn" data-id="${recipe.id}">★ Favorite</button>
      `;

      // Favorite button handling
      const favBtn = card.querySelector(".fav-btn");
      if (favs[recipe.id]) favBtn.classList.add("active");

      favBtn.addEventListener("click", () => {
        if (favs[recipe.id]) {
          delete favs[recipe.id];
          favBtn.classList.remove("active");
        } else {
          favs[recipe.id] = {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            sourceUrl: recipe.sourceUrl
          };
          favBtn.classList.add("active");
        }
        saveFavorites(favs);
      });

      resultsDiv.appendChild(card);
    });

    // Update total recipes
    const totalSpan = document.getElementById("totalRecipes");
    if (totalSpan) totalSpan.innerText = data.results.length;

  } catch (error) {
    console.error(error);
    resultsDiv.innerHTML = "<p style='color:red;'>Error fetching recipes. Try again later.</p>";
  }
}

// ===========================
// Diet Button Logic (already in HTML script tag, but safe here)
// ===========================
const dietButtons = document.querySelectorAll('.diet-btn');
const dietInput = document.getElementById('dietType');

dietButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    dietButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    dietInput.value = btn.dataset.diet;
  });
});

// ===========================
// Search Button Click
// ===========================
const searchBtn = document.getElementById("findBtn");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    findRecipes();
  });
}

// ===========================
// Optional: Trigger search on Enter key
// ===========================
const ingredientsInput = document.getElementById("ingredients");
if (ingredientsInput) {
  ingredientsInput.addEventListener("keypress", e => {
    if (e.key === "Enter") findRecipes();
  });
}
