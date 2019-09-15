/**
 * Proxy for window.onload
 */
 class Onload {
     private static _hasLoaded = false;
     private static _cbList = [];
     
     /**
      * Checks if the onload event has been fired
      */
     public static get isLoaded() : boolean {
         return Onload._hasLoaded;
     }
     
     public static addEventListener(cb: () => void) {
        if (Onload.isLoaded == false)
            Onload._cbList.push(cb); // if event hasn't yet fired => keep reference
        else
            cb(); // Webpage has been loaded => fire immediatly
     }

     /**
      * Internal function: Should not be used outside the source file
      *
      * @return  {[type]}  [return description]
      */
     static _fire() {
         Onload._hasLoaded = true; // set flag to true
         Onload._cbList.forEach(cb => cb()); // call all the callbacks
         Onload._cbList = []; // remove all the references to the callbacks
     }
 }

 window.addEventListener("load", Onload._fire);