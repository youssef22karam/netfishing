// Collects the source chunks (js/boat.NN.js, sea.NN.js, game.NN.js) so boot.js can rebuild each module.
self.__ss = (key, text) => { ((self.__SS = self.__SS || {})[key] = (self.__SS[key] || [])).push(text.slice(1)); }; // slice(1) drops the newline after the opening backtick
