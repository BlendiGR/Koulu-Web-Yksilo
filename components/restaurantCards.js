import { onRestaurantsChange } from "./map.js";

// Subscribe to restaurant list updates.
onRestaurantsChange((list) => {
  console.log("Got new restaurants:", list);
});
