# Pokemon Detail Pages - Implementation Plan

## Overview
This plan outlines how to add individual detail pages for each Pokemon in the Pokedex app. Users will be able to click on a Pokemon card to navigate to a detailed view showing stats, abilities, types, and more.

## Current Architecture
- Single-page application with vanilla JavaScript
- No routing currently implemented
- Dynamic DOM manipulation for Pokemon cards
- RESTful API consumption from PokeAPI
- Caching system already in place (`pokemonCache`)

---

## Phase 1: Set Up Client-Side Routing
Since you're using vanilla JS with no framework, you'll need a simple routing mechanism. We'll use **hash-based routing** (URLs like `#/pokemon/25` for Pikachu).

**Steps:**
1. Add a router function that listens for URL hash changes
2. Create a function to parse the hash and determine what to show
3. Set up navigation between list view and detail view

**Why hash-based routing?**
- Works without a server (no 404 errors on refresh)
- Simple to implement in vanilla JS
- Browser back/forward buttons work automatically

---

## Phase 2: Restructure Your HTML Layout
You'll need to support two different views on the same page.

**Steps:**
1. Wrap your current Pokemon list section in a container (e.g., `<div id="list-view">`)
2. Create a new container for detail pages (e.g., `<div id="detail-view">`)
3. Add logic to show/hide these containers based on the current route

**Why this approach?**
- Keep it simple: one HTML file, two views
- Show/hide based on route rather than creating/destroying DOM
- Maintains existing functionality without breaking changes

---

## Phase 3: Make Cards Clickable
Connect your existing Pokemon cards to the routing system.

**Steps:**
1. Modify `createPokemonCard()` to add a click handler
2. On click, update the URL hash to navigate to the detail page (e.g., `#/pokemon/25`)
3. Ensure the card cursor changes to pointer on hover

**Why modify the card creation function?**
- Centralized: every card gets the same behavior
- Clean separation: cards handle navigation, router handles rendering

---

## Phase 4: Create Detail Page Structure
Build a function to generate the detail page HTML dynamically.

**Steps:**
1. Create a `renderDetailPage(pokemonId)` function
2. Fetch the Pokemon data (reuse your existing `fetchPokemon()` function!)
3. Create HTML structure showing:
   - Pokemon image (larger version)
   - Name and ID
   - Types (with colored badges)
   - Stats (HP, Attack, Defense, etc.) - display as progress bars
   - Height and weight
   - Abilities
   - A "Back" button to return to the list

**Data available from PokeAPI:**
- `pokemon.sprites.other['official-artwork'].front_default` - high-res image
- `pokemon.types` - array of type objects
- `pokemon.stats` - array with HP, Attack, Defense, Sp. Atk, Sp. Def, Speed
- `pokemon.height` and `pokemon.weight` - numeric values
- `pokemon.abilities` - array of ability objects

---

## Phase 5: Style the Detail Page
Add CSS for your detail page layout.

**Steps:**
1. Style the detail container (card-like design to match existing aesthetic)
2. Style type badges with appropriate colors
3. Style stat bars (progress bars work well visually)
4. Make it responsive for mobile
5. Add back button styling

**Type color suggestions:**
```
normal: #A8A878
fire: #F08030
water: #6890F0
electric: #F8D030
grass: #78C850
ice: #98D8D8
fighting: #C03028
poison: #A040A0
ground: #E0C068
flying: #A890F0
psychic: #F85888
bug: #A8B820
rock: #B8A038
ghost: #705898
dragon: #7038F8
dark: #705848
steel: #B8B8D0
fairy: #EE99AC
```

---

## Phase 6: Handle Navigation
Make sure users can move between views smoothly.

**Steps:**
1. Add a back button that changes the hash to `#/` (home)
2. Test browser back/forward buttons work correctly
3. Ensure pagination and search only show on the list view
4. Preserve scroll position when returning to list

---

## Phase 7: Polish & Edge Cases
Handle any edge cases and polish the experience.

**Steps:**
1. Add loading states while fetching detail data
2. Handle invalid Pokemon IDs (show error message or redirect)
3. Preserve search/pagination state when returning to list
4. Test on different screen sizes
5. Add animations/transitions for smooth view changes

---

## Technical Notes

### Routing Implementation
- Use `window.addEventListener('hashchange', ...)` to detect route changes
- Use `window.location.hash` to read/write the current route
- Parse hash to extract route and parameters

### Data Fetching
- Your existing `fetchPokemon(id)` function returns all needed data
- Caching is already implemented, so repeated visits are fast
- No additional API calls needed!

### State Management
- Consider storing current page/search state to restore when navigating back
- Could use `sessionStorage` or global variables

---

## Success Criteria
- ✅ Users can click Pokemon cards to see detail pages
- ✅ URL updates when navigating (e.g., `#/pokemon/25`)
- ✅ Browser back/forward buttons work correctly
- ✅ Detail page shows comprehensive Pokemon information
- ✅ Users can return to the list view easily
- ✅ Responsive design works on mobile and desktop
- ✅ Loading states provide feedback during data fetching
