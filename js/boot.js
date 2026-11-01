/* Rebuilds the three original module scripts from their chunks and starts them in the original order:
   1. boat model  -> defines window.BoatKit        (the sea simulator calls it while starting up)
   2. sea simulator -> defines window.sea
   3. fishing game -> waits for window.sea.boat on its own
   They are inserted as inline module scripts, so the page keeps working from a local file as well as from a server. */
(() => {
  const P = self.__SS || {};
  const join = (k) => (P[k] || []).join("");
  const run = (id, text) => {
    const s = document.createElement("script");
    s.type = "module"; s.id = id; s.textContent = text;
    document.body.appendChild(s);
  };
  const until = (test, ms) => new Promise((done) => {
    const t0 = performance.now();
    (function poll() { if (test() || performance.now() - t0 > ms) done(); else setTimeout(poll, 20); })();
  });
  run("boat-module", join("boat"));
  until(() => window.BoatKit, 30000).then(() => {
    run("sea-module", join("sea"));
    run("game-module", join("game"));
    delete self.__SS;
  });
})();
