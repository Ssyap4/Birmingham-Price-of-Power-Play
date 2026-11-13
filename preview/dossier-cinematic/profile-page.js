/* Compatibility entry: old quiz dossier is replaced by the campaign player dossier. */
(()=>{'use strict';const launch=()=>window.BirminghamProfileV2?.open?.();const button=document.getElementById('profileBtn');if(button)button.onclick=launch;})();
